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
            'class': ['row', 'col']
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
			        th.textContent = columnName;
			        th.innerText = columnName;
			        tr.appendChild( th );
			    });
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
			            td.setAttribute( 'class',  'col ' + key );
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
			        tr.setAttribute( 'class', 'row' + key );
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

				updateData = function( data, columns )
				{
					columns || ( columns = util.keysObject( data[ 0 ] ) );
					var tbody = this.tBodies[ 0 ],
					    lastColumns = util.keysObject( this.params.data[ 0 ] );

					/*if( columns.length < lastColumns.length )
						for( var i = 0, l = this.rows.length; i < l; i++ )
							for( var j = lastColumns.length, k = util.keysObject( data[ i ] ).length; k < j; k++ )
								this.rows[ i ].cells[ this.rows[ i ].cells.length - 1 ].remove();*/

					if( data.length < this.params.data.length )
						for( var i = 1; i <= this.params.data.length - data.length; i++ )
							this.rows[ this.rows.length - 1 ].remove();
					
					else if( data.length > this.params.data.length )
						for( var i = 0; i < data.length - this.params.data.length; i++ )
						{
							var tr = document.createElement( 'tr' );
							for( var j = 0; j < columns.length; j++ )
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

					columns === undefined || ( data = filterData( data, columns ) );
					
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
											index_col++;
										}
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

        initResponsive = function( table )
        {
        	window.addEventListener( 'resize', function( e ) 
        	{
        		if( ( window.innerWidth < 768 && table.classList.contains( 'tblFull' ) ) ||
        		    ( window.innerWidth > 767 && table.classList.contains( 'tblResponsive' ) ) )
        		{
        			table.remove();
        			table = initGrid( table.params.paramsUser );
        		}

        	}, false );
        },

        initGrid = function( params )
        {
        	window.changeAsTwoColumns = changeAsTwoColumns;
        	params.paramsUser = Object.assign( {}, params );
        	checkParams( params );
		    var classes = params.attrs.class || '';
			classes = classes.replace( /\s|tblFull|tblResponsive/g, '' );

		    if( window.innerWidth < 768 )
		    {
        		params.data = changeAsTwoColumns( params.data, params.labelResponsive );
		    	params.columnsName = [ '' ];
		    	classes += ' tblResponsive';
		    }
		    else
		    	classes += ' tblFull';

		    params.attrs.class = classes;

            !params.columns.length > 0 || ( params.data = filterData( params.data, params.columns ) );

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
        }
    })
	.apply( grid );

})(window, document);