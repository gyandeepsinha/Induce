$(document).ready(function(){
	//reset form inside modal after click on close or any where on page
	$('#languageModal').on('hidden.bs.modal',function(){
		$(this).find('form').trigger('reset');
	});
	$('#tblLanguageDetails').DataTable({
        responsive: true,
        fnRowCallback: function(nRow, aData, iDisplayIndex, iDisplayIndexFull){
        	if (aData[2] == "Inactive"){
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
    // handle click event of Add Category Button
	$('#btnAddLanguage').click(function(){
		$('#languageForm').attr('action','/addLangauge');
		$('#btnAddlanguageModal').html('Add Language');
	});
    // handle click event of Edit Category Button
	$('.btnLanguageEdit').click(function(){
		var languageID = $(this).data("id");
		$('#languageForm').attr('action','/editLanguage?languageID='+languageID);
		$.ajax({
			url		:'/getLanguageDetailsByID?languageID='+languageID,
			type	: 'GET',
			success	:  function(languageDetails){
					$('#txtLanguageName').val(languageDetails[0].langName);
					$('#txtDisplayLanguageName').val(languageDetails[0].langDisplayName);
					$("input[name='rdbStatus'][value="+languageDetails[0].langStatus+"]").prop('checked',true);
					$('#btnAddlanguageModal').html('Update Language');
			},
			error	:  function(error){
					window.location = '/language';
			}
		});
	});
	 // handle click event of remove button 
    $('#tblLanguageDetails').on('click', '.btnRemoveLanguage', function(){
   		var languageID = $(this).data("id");
		bootbox.confirm('Are you really want to delete language ?',function(result){
			if(result){
				$.ajax({
					url		: '/removeLanguage?languageID='+languageID,
					type	: 'GET',
					success	: function(result){
							window.location = '/language';
					},
					error	: function(error){
							window.location = '/language';
					}
				});
			}
		});
	});
});