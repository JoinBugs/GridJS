( function( window, document, undefined )
{
	window.addEventListener( 'load', init, false );

	function init()
	{
		var users = [
			{ 'id' : 0, 'name' : 'Andres', 'isMarried' : false, 'pets' : [ 'Dog', 'Turtle'] },
			{ 'id' : 1, 'name' : 'Jorge', 'isMarried' : true, 'pets' : [ 'Bird', 'Fish', 'Dog'] },
			{ 'id' : 2, 'name' : 'Lucy', 'isMarried' : false, 'pets' : [ 'Duck', 'Eagle', 'Delphi' ] },
			{ 'id' : 3, 'name' : 'Yechis', 'isMarried' : true, 'pets' : [ 'Cuyo', 'Hasmter', 'Turtle'] },
			{ 'id' : 4, 'name' : 'Maria', 'isMarried' : false, 'pets' : [ 'Bird', 'Dog'] },
			{ 'id' : 5, 'name' : 'Pedro', 'isMarried' : true, 'pets' : [ 'Horse', 'Ponny', 'Cown' ] },
	    ],
	    
			table = grid.createGrid(
		    {
		        'data': users,
		        'appendNode': '#main',
		        'labelResponsive':  'User',
		        'attrs': {
		             'id': 'tblUsers',
		             'class': 'table'
		        }
		    });

		var newData =  [
			{ 'id' : 0, 'name' : 'Pedro', 'isMarried' : true, 'pets' : [ 'Dog', 'Turtle'] },
			{ 'id' : 1, 'name' : 'Daniel', 'isMarried' : false, 'pets' : [ 'Bird', 'Fish', 'Dog'] },
			{ 'id' : 2, 'name' : 'Julia', 'isMarried' : true, 'pets' : [ 'Duck', 'Delphi' ] },
			{ 'id' : 3, 'name' : 'Azusena', 'isMarried' : false, 'pets' : [ 'Cuyo', 'Hasmter', 'Turtle'] }
	    ];

		 document.querySelector( '#btnUpdate' )
		 		.addEventListener( 'click', function( e )
		 		{
				 	table.updateData({
				    	'data' : newData
				    });
		 		}, 
		 		false );

		window.table = table;
	}
})
( window, document );