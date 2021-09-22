$(document).ready(function() {
	$('#txtLangDisplayName').attr('value',$('#drpLanguage  option:selected').text());
	//reset form inside modal after click on close or any where on page
	$('#categoryModal').on('hidden.bs.modal',function(){
		$(this).find('form').trigger('reset');
		$("#txtImage").prop('required',true);
	});
	$('#drpLanguage').on('change',function(){
		$('#txtLangDisplayName').attr('value',$('#drpLanguage  option:selected').text());
	});
	// handle click event of Add Category Button
	$('#btnAddCategory').click(function(){
		$('#categoryForm').attr('action','/addCategory');
		$('#btnAddCategoryModal').html('Add Category');
	});
	// handle click event of Edit Category Button
	$('.btnCategoryEdit').click(function(){
		var categoryID = $(this).data("id");
		$("#txtImage").attr('required',false);
		$('#categoryForm').attr('action','/editCategory?categoryID='+categoryID);
		$.ajax({
			url		:'/getCategoryDetailsByID?categoryID='+categoryID,
			type	: 'GET',
			success	:  function(categoryDetails){
					$("#drpLanguage option[value=" + categoryDetails[0].langId +"]").attr("selected","selected");	
					$('#txtCategory').val(categoryDetails[0].catName);
					$('#txtDescription').val(categoryDetails[0].catDescription);
					$("input[name='rdbStatus'][value="+categoryDetails[0].catStatus+"]").prop('checked',true);
					$('#btnAddCategoryModal').html('Update Category');
			},
			error	:  function(error){
			}
		});
	});
	// makes datatable responsive
    $('#tblCategoryDetails').DataTable({
        responsive: true,
        fnRowCallback: function(nRow, aData, iDisplayIndex, iDisplayIndexFull){
        	if (aData[3] == "Inactive"){
                $('td', nRow).css('background-color', 'rgb(158, 158, 158)');
            }
        },
        columnDefs: [{
			targets: 1,
	        render: function ( data, type, row ) {
			    return type === 'display' && data.length > 10 ?
			        data.substr( 0, 50) +'…' :
			        data;
	        }
    	},
    		{responsivePriority: 1, targets: 0},
    		{responsivePriority: 10001, targets: 1},
    		{responsivePriority: 10001, targets: 2},
    	]
    });
    // handle click event of remove button 
    $('#tblCategoryDetails').on('click', '.btnremoveCategory', function(){
   		var categoryID = $(this).data("id");
		bootbox.confirm('Are you really want to delete category ?',function(result){
			if(result){
				$.ajax({
					url		: '/removeCategory?categoryID='+categoryID,
					type	: 'GET',
					success	: function(result){
							window.location = '/category';
					},
					error	: function(error){
							window.location = '/category';
					}
				});
			}
		});
	});
});