(function (window, document, undefined) 
{
    var	grid 	= {},
    	events	= {};

    grid.events = events;
    window.grid = grid;

     //listeners methods
    (function () 
    {
        var that = this,
    		pref = 'on';

    	//object that contains all events of a node.
        events = (function () 
        {
            var node = document.createElement('div'),
                events = [],
                pref = 'on';
            for (var key in node)
                if (s.startsWith(key, pref))
                    events.push(key.replace(pref, ''));
            return events;
        })();

        var applyListener = function (compo) 
        {
            _.forEach(events, function (event) 
            {
                that[pref + util.toCapitalize(event) + util.toCapitalize(compo.id)] = function (cssSelector, exec) 
                {
                    var tNodes = _.toArray(document.querySelectorAll(cssSelector + compo.tNode));

                    _.forEach(tNodes, function (tNode, tIndex) 
                    {
                        tNode.addEventListener(event, function (e) 
                        {
                            exec(e, tNode, tIndex);
                        },
                            false);
                    });
                };
            });
        };
        applyListener({ id: 'Row', tNode: ' tr' });
        applyListener({ id: 'Col', tNode: ' td' });
        applyListener({ id: 'Compo', tNode: '' });
    })
    .apply(events);


    // methods more useful.
    (function () 
    {
        this.attributes = {
        	'row_head' : 'title',
            'row' : 'row',
            'col' : 'col'
        },
		that = this;

        var table = document.createElement( 'table' ),

			setAttrs = function ( node, attrs ) 
			{
			    for (var key in attrs)
			        node.setAttribute( key, attrs[key] );
			},

			getHeaders = function ( columnsName ) 
			{
			    var tHead = document.createElement( 'thead' ),
					tr = document.createElement( 'tr' );

			    _.forEach( columnsName, function ( columnName ) 
			    {
			        var th = document.createElement( 'th' );
			        th.setAttribute( 'class', that.attributes.col + ' ' + columnName );
			        th.textContent = columnName;
			        th.innerText = columnName;
			        tr.appendChild( th );
			    });
			    tr.setAttribute( 'class', that.attributes.row + ' ' + that.attributes.row_head );
			    tHead.appendChild( tr );
			    return tHead;
			},

			tryType = {
				boolean	: function( item )
				{
					var boxCheck 		= document.createElement( 'input' );
					boxCheck.type 		= 'checkbox';
					boxCheck.checked 	= item;
					return boxCheck;
				},

				array : function( items )
					{
						var select = document.createElement( 'select' );
						_.forEach( items, function( item )
						{
							var option = document.createElement( 'option' );
							option.value = item;
							option.textContent = item;
							option.innerText = item;
							select.appendChild( option );
						});
						return select;
					}
				},

			getBody = function ( items ) 
			{
				var rows = [],

				countColumns = util.keysObject( items[ 1 ] ).length,

			    tbody = document.createElement('tbody');
			    //tbody.rows = rows;

			    _.forEach( items, function (item) 
			    {
			        var tr 	 = document.createElement('tr'),
			            cols = []; 
			        tr.cols = cols;
			        for (var key in item) 
			        {
			            var td    = document.createElement('td'),
			                types = util.keysObject( tryType ),
			                value = item[ key ],
			                type  = util.toType( value );
			            td.setAttribute( 'class', that.attributes.col + ' ' + key );
			            cols.push( td );
			            if( _.indexOf( types, type ) !== -1 )
			            	td.appendChild( tryType[ type ]( value ) );
			            else
			            {
			            	if( key === 'innerHTML' )
			            		td.innerHTML = value;
			            	else
			            	{
				            	td.textContent = value;
				            	td.innerText = value;
			            	}
			            }
			            tr.appendChild(td);
			        }
			        key = ' ' + key;
			        if( countColumns > 2 )
			        	key = '';
			        tr.setAttribute( 'class', that.attributes.row + key );
			        tbody.appendChild(tr);
			        rows.push( tr );
			    });

			    return tbody;
			},

			addColumn = function( args )
			{
				if( args.innerHTML !== null )
				{
					args.table || ( args.table = this );
					args.index !== undefined || ( args.index = 1 );
					var td = document.createElement( 'td' );
					td.innerHTML = args.innerHTML;
					args.table.rows[ args.index ].appendChild( td );
				}
			},

			addColumns = function( args )
			{
				args.table || ( args.table = this );
				args.count || ( args.count = 1 );
			    args.nameColumn === undefined || ( function()
							  {
							  	var th = document.createElement( 'th' );
							  	th.textContent = args.nameColumn;
							  	args.table.rows[ 0 ].appendChild( th );
							  })();
				for( var i = args.count, l = args.table.rows.length; i < l; i++ )
							addColumn( {
								innerHTML 	: args.innerHTML,
								table 		: args.table,
								index 		:  i
							});

				/*
					Agregando a la tabla el componente agregado como una columna, 
					se agregara como una propiedad de la tabla el nombre de la propiedad
					sera el nombre de la clase del componente.
				 */
				( function( table )
					{
						var classColumn = table.rows[ 1 ].cells[ table.rows[ 1 ].cells.length - 1 ]
																.querySelector( '*' ).getAttribute( 'class' );
						var add = function( methodName, callBack )
						{
							grid.events[ 'on' + s.capitalize( methodName ) + 'Compo' ]( '.' +  classColumn, callBack );
						};

						table[ classColumn ] = {
							add : add
						};
					})( args.table );
			},

			addBtnDelete = function( args )
			{
				var text = args.text,
				    table = args.table,
				    callBack = args.onDelete;

				if( text === null ) return;
				table || ( table = this );
				text  || ( text = 'Delete Row' );
				var innerHTML = '<button class="table btnDelete">' + text + '</button>';
				addColumns( { innerHTML : innerHTML, table : table }  );
				var btns = _.toArray( table.querySelectorAll( '.table.btnDelete ' ) );
				_.forEach( btns, function( btnDel, index )
				{
					btnDel.addEventListener( 'click', function( e )
					{
						!callBack || callBack( e );
						table.params.data.splice( _.indexOf( _.toArray( table.rows ), e.target.parentNode.parentNode ) - 1, 1 );
						e.target.parentNode.parentNode.remove();
					}, false);
				});
				return btns;
			},

			changeNameHeader = function( headerOrigin, headerNew, table )
			{
				table || ( table = this );
				var indexColumn = util.toType( headerOrigin ) === 'number'? headerOrigin : _.indexOf( table.params.columnsName, headerOrigin );
				if( indexColumn !== -1 )
					table.rows[ 0 ].cells[ indexColumn ].textContent = headerNew;
				else
					throw Error( 'Do Not exists a column called ' + headerOrigin );
			},

			addHeader = function( headerNew, table )
			{
				table || ( table = this );
				var tE = util.toArray( table.tHead.rows[ 0 ].cells ).
							find( function( e ) { 
								return e.textContent == headerNew; 
							});
				if ( tE === undefined )
				{
					var th = document.createElement( 'th' );
					th.textContent = headerNew;
					table.rows[ 0 ].appendChild( th );
				}
				/*else
					throw new Error( headerNew + ' is yet in headers, cannot add a duplicate header in headers' );*/
			},

			removeHeader = function( headerTitle, table )
			{
				table || ( table = this );
				var th = util.toArray( table.tHead.rows[ 0 ].cells ).
							find( function( e ) { 
								return e.textContent == headerTitle; 
							});
				if( th !== undefined )
					th.remove();
				else
					throw new Error( headerTitle + ' is not in headers' );
			};

			var filterData = function( items, keysFilter )
			{
				return _.map( items,  function( item )
				{
					var newItem = {};
					for( var key in item )
						if( _.indexOf( keysFilter, key ) !== -1 )
							newItem[ key ] = item[ key ];
					return newItem;
				});
			},

				paramsDefault = {

					data : function()
					{
						return null;
					},

					columns : function()
					{
						return [];
					},

					appendNode : function()
					{
						return null;
					},

					attrs : function()
					{
						return {};
					},

					addColumns : function()
					{
						return null;
					},

					addBtnDelete : function()
					{
						return null;
					},

					labelResponsive : function()
					{
						return "Data";
					}
				},

				/*
					clickRow
					mouseoverRow
				*/
				addEvent = function( eventName, callBack, tableCSSSelector )
				{
				    tableCSSSelector || ( tableCSSSelector = "#" + this.id );
					grid.events[ 'on' + util.toCapitalize( eventName )]( tableCSSSelector, callBack );
				},

				checkParams = function( params )
				{
					for( var key in paramsDefault )
						params[ key ] !== undefined || ( params[ key ] = paramsDefault[ key ]() );
				},

				updateData = function( args )
				{
					var data 	= args.data, 
						columns = args.columns,
						columnsName = args.columnName;

					columns === undefined || ( data = filterData( data, columns ) );
					columns || ( columns = util.keysObject( data[ 0 ] ) );
					var tbody = this.tBodies[ 0 ],
					    lastColumns = util.keysObject( this.params.data[ 0 ] );

					// remove rows if the new data has less objects than the old data.
					if( data.length < this.params.data.length )
						for( var i = 1; i <= this.params.data.length - data.length; i++ )
							this.rows[ this.rows.length - 1 ].remove();
					
					/*
						add rows if the new data is bigger than the last one 
						and add columns for this rows
					*/
					else if( data.length > this.params.data.length )
						for( var i = 0, l = data.length - this.params.data.length; i < l; i++ )
						{
							var tr = document.createElement( 'tr' ),
							    tags = _.keys( data[  data.length - l + i ] );
							for( var j = 0, k = tags.length; j < k; j++ )
								tr.appendChild( document.createElement( 'td' ) );
							if( this.params.addColumns !== null )
							{
								var td = document.createElement( 'td' );
								td.innerHTML = this.params.addColumns.innerHTML;
								tr.appendChild( td );
							}
							if( this.params.addBtnDelete !== null )
							{
								var td = document.createElement( 'td' ),
									self = this;
								td.innerHTML =  '<button class="table btnDelete">' + this.params.addBtnDelete + '</button>';
								tr.appendChild( td );
								td.querySelector( '.table.btnDelete' ).addEventListener( 'click', function( e )
								{
									self.params.data.splice( _.indexOf( _.toArray( self.rows ), e.target.parentNode.parentNode ) - 1, 1 );
									e.target.parentNode.parentNode.remove();
								}, false );
							}
							tbody.appendChild( tr );
						}

					/* in case of the new data has headers less than the last one, quit each one.
					   the otherwise add more headers until than there is ones like columns in the new data. 
					*/
					for( var i = 0, 
						     j = this.rows[ 0 ].cells.length - _.keys( data[ 0 ] ).length,
						     l = Math.abs( j ); 
						     i < l;
						     i++ )
						if( j > 0 )
							this.rows[ 0 ].cells[ this.rows[ 0 ].cells.length - 1 ].remove();
						else
							this.rows[ 0 ].appendChild( document.createElement( 'th' ) );


					/*
					  add text to headers, it for each one.
					*/
						for( var i      = 0,
							     cells  = this.rows[ 0 ].cells,
							     labels = columnsName || _.keys( data[ 0 ] ),
							     l      = cells.length;
							     i < l; i++ )
						{
							cells[ i ].setAttribute( 'class', that.attributes.col + ' ' + labels[ i ] );
							cells[ i ].textContent = labels[ i ];
						}

					/*
					  remove columns if the new data is less than the old data
					  or add columns if the new data is bigger than the old data.
					*/
					for( var i = 1, l = this.rows.length; i < l; i++ )
					{
						// quit columns if the new data has less.
						for( var j = this.rows[ i ].cells.length, k = util.keysObject( data[ i - 1 ] ).length; k < j; k++ )
							this.rows[ i ].cells[ this.rows[ i ].cells.length - 1 ].remove();
						
						//
						for( var j = this.rows[ i ].cells.length, k = util.keysObject( data[ i - 1 ] ).length; k > j; k-- )
							this.rows[ i ].appendChild( document.createElement( 'td' ) );
					}

					
					var self = this;
					_.forEach( _.toArray( this.rows ).slice( 1 ),
							 function( row, index_row )
									{
										var cells 		= row.cells,
										    index_col	= 0,
										    item 		= data[ index_row ];
										for( var e in item )
										{
								            var types = util.keysObject( tryType ),
								                value = item[ e ],
								                type  = util.toType( value );

								            if( _.indexOf( types, type ) !== -1 )
								            {
								            	util.emptyNode( cells[ index_col ] );
								            	cells[ index_col ].appendChild( tryType[ type ]( value ) );
								            }
								            else
								            {
								            	if( e === 'innerHTML' )
								            		cells[ index_col ].innerHTML = value;
								            	else
								            	{
									            	cells[ index_col ].textContent = value;
									            	cells[ index_col ].innerText = value;
								            	}
								            }
								            cells[ index_col ].setAttribute( 'class',  that.attributes.col + ' ' + e );
											index_col++;
										}
										e = ' ' + e;
								        if( columns.length > 2 )
								        	e = '';
								        row.setAttribute( 'class', that.attributes.row + e );
									});
					this.params.data = data;
					this.params.columns = columns;
				},

		changeAsTwoColumns = function( data, label )
        {
            var columns = util.keysObject( data[ 0 ] ),
                newData = [];

            for( var i = 0, l = data.length; i < l; i++ )
            {
            	var item = data[ i ];
            	if( label !== undefined )
            	{
            		var rowResponsive = {};
            		rowResponsive[ label ] = label;
            		newData.push( rowResponsive );
            	}
            	for( var j = 0, k = columns.length; j < k; j++ )
            	{
            		var newRow = {},
            		    column = columns[ j ];

            		newRow[ 'label' ] = column;
            		newRow[ column ] = item[ column ];
            		newData.push( newRow );
            	}
            }
            return newData;
        },

        ModeTable = {
        	'RESPONSIVE' : 'tblResponsive',
        	'FULL' : 'tblFull'
        },

        isModeResponsive = function()
        {
        	return window.innerWidth < 768;
        },

        isModeTableFull = function()
        {
        	return !isModeResponsive();
        },

        changeModeTable = function( table, mode )
        {
        	var	classes  = table.params.attrs['class'] || '',
        		params   = table.params;

        	classes = classes.replace( /\s|tblFull|tblResponsive/g, '' );
        	params.attrs['class'] = classes + ' ' + mode
        	setAttrs( table, params.attrs );
        },

   		onChangeModeTable = function( table, callback )
   		{
   			window.addEventListener( 'resize', function( e )
   			{
	   			var attrs = table.params.attrs;

	   			if( isModeResponsive() && (/tblFull/).test( attrs[ 'class' ] ) )
	   			{
	   				callback( ModeTable.RESPONSIVE );
	   				changeModeTable( table, ModeTable.RESPONSIVE );
	   			}
	   			else if( isModeTableFull() && (/tblResponsive/).test( attrs[ 'class' ] ) )
	   			{
	   				callback( ModeTable.FULL );
	   				changeModeTable( table, ModeTable.FULL );
	   			}
   			},
   			false );
   		},

        initResponsive = function( table )
        {
        	onChangeModeTable( table, function( mode )
        	{
	        	var params     = table.params,
	        		data 	   = table.params.paramsUser.data;

        		if( mode === ModeTable.RESPONSIVE )
        			data = changeAsTwoColumns( data, params.labelResponsive );

        		table.updateData({
        			'data' : data
        		});
        	});
        },

        initGrid = function( params )
        {
        	//check params and add properties if these ones are not in the object's params the otherwise its not anything
        	checkParams( params );

        	/* 
        	   check if there the user wants filter your data columns 
        	   if it is case, save the new data in the user's data 
        	*/
            !params.columns.length > 0 || ( params.data = filterData( params.data, params.columns ) );
        	
            /*
              save the initial users's parameters in a new var, 
              this is very usefull in case of the grid to be responsive.
            */
        	params.paramsUser = JSON.parse( JSON.stringify( params ) );

		    var classes = params.attrs['class'] || '';
			classes = classes.replace( /\s|tblFull|tblResponsive/g, '' );

		    if( isModeResponsive() )
		    {
        		params.data = changeAsTwoColumns( params.data, params.labelResponsive );
		    	params.columnsName = [ '' ];
		    	classes += ' tblResponsive';
		    }
		    else
		    	classes += ' tblFull';

		    params.attrs['class'] = classes;


            var table = document.createElement( 'table' );
            table.params = params;
            table.appendChild( getHeaders( params.columnsName || ( params.columnsName = util.keysObject( params.data[ 0 ] ))  ) );
            table.appendChild( getBody( params.data ) );

            if( params.addColumns !== null )
            	addColumns( { innerHTML : params.addColumns.innerHTML, nameColumn : params.addColumns.nameColumn, table : table } );
            //table.btnsDelete = addBtnDelete( params.addBtnDelete, table );

            setAttrs( table, params.attrs );
            params.appendNode === null || document.querySelector( params.appendNode ).appendChild( table );
            table.updateData 		= updateData;
            table.addColumns 		= addColumns;
            table.addColumn  		= addColumn;
            table.changeNameHeader	= changeNameHeader;
            table.addHeader			= addHeader;
            table.removeHeader 		= removeHeader;	
            table.addBtnDelete		= addBtnDelete;
            table.addEvent 			= addEvent;
            
            return table;
        };

        this.createGrid = function ( params ) 
        {
        	var table = initGrid( params );
        	if( params.labelResponsive !== undefined )
        		initResponsive( table );
        	return table;
        };

        this.createGridServer = function ( params ) 
        {
            if ( window.utilAjax === undefined )
                return "this library require utilAjax.js";

            window.utilAjax.post( params.urlSource, function ( response ) 
            {
            	params.data = response;
            	var table = that.createGrid( params );
            	if( params.onLoad !== undefined )
            		params.onLoad( table );
            }, params.args);
        };
    })
	.apply( grid );

})(window, document);