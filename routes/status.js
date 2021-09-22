$(document).ready(function(){
	$(".typeImage").hide();
	$(".typeVideo").hide();
	// reset modal form after closing or clicking anywhere in form
	$('#statusModal').on('hidden.bs.modal',function(){
		$(this).find('form').trigger('reset');
		$('#txtColorCode').attr('value','#000000');
		$('#txtColor').attr('value','#000000');
		$("#drpLanguage").find('option').removeAttr("selected");
		$("#drpStatusType").find('option').removeAttr("selected");
		$('#drpCategory').find('option').remove();
		$("#drpLanguage").prop('disabled',false);
		$("#drpCategory").prop('disabled',false);
		$("#drpStatusType").prop('disabled',false);
		$('#imgStatusImage').attr('src', '../Images/users/sampleUserPhoto.png');
		$(".typeImage").hide();
		$(".typeText").show();
		$('#drpCategory').append($("<option></option>").attr("value",0).text('Select Category'));
	});
	//set color code from color picker in textbox
	$('#txtColor').on('change',function(){
		$('#txtColorCode').val($('#txtColor').val());
	});
	// click event of Add Status Button
	$('#btnAddstatus').click(function(){
		$('#btnAddstatusModal').html('Add Status');
		$('#statusForm').attr('action','/addStatus');
	});
	// make datatable responsive
    $('#tblStatusDetails').DataTable({
        responsive: true,
        fnRowCallback: function(nRow, aData, iDisplayIndex, iDisplayIndexFull){
        	if (aData[2] == "Inactive"){
                $('td', nRow).css('background-color', 'rgb(158, 158, 158)');
                $('td:eq(4)', nRow).html('');

            }
        },
        columnDefs: [{
        	targets: 1,
	        render: function ( data, type, row ) {
			    return type === 'display' && data.length > 10 ?
			        data.substr( 0, 90) +'…' :
			        data;
	        }
        },
            { responsivePriority: 1, targets: 0 },
            { responsivePriority: 10001, targets: 1 },
            { responsivePriority: 10001, targets: 2 }
        ]
    });
    // handle click event of edit option
    $('#tblStatusDetails').on('click','.btnStatusEdit',function(){
		var statusID 	= 	$(this).data("id");
		$('#statusForm').attr('action','/editStatus?statusID='+statusID);
		$.ajax({
			url		:'/getStatusDetailsByID?statusID='+statusID,
			type	: 'GET',
			success	:  function(statusDetails){
					$("#drpLanguage option[value=" + statusDetails[0].langId +"]").attr("selected","selected");
					$('#drpCategory').append($("<option></option>").attr("value",statusDetails[0].catId).text(statusDetails[0].catName));
					$("#drpCategory option[value=" + statusDetails[0].catId +"]").attr("selected","selected");
					$("#drpStatusType option[value=" + statusDetails[0].staType +"]").attr("selected","selected");
					$("#drpLanguage").attr('disabled',true);
					$("#drpCategory").attr('disabled',true);
					$("#drpStatusType").attr('disabled',true);
					if($("#drpStatusType").val()==2){
						$(".typeImage").show();
			    		$(".typeText").hide();			    		
			    		$(".typeVideo").hide();			    		
			    		$('#imgStatusImage').attr('src','../Images/status/'+statusDetails[0].staImage);
			    	}else if($("#drpStatusType").val()==1){
			    		$(".typeText").show();
			    		$(".typeImage").hide();
			    		$(".typeVideo").hide();
			    	}else{
			    		$(".typeVideo").show();
			    		$(".typeText").hide();
			    		$(".typeImage").hide();			    		
			    	}
					$('#txtLangId').val(statusDetails[0].langId);
					$('#txtCatId').val(statusDetails[0].catId);
					$('#txtMessage').val(statusDetails[0].staMessage);
					$('#txtColorCode').attr('value',statusDetails[0].staColor);
					$('#txtColor').attr('value',statusDetails[0].staColor);					
					$("input[name='rdbStatus'][value="+statusDetails[0].staStatus+"]").prop('checked',true);
					$('#btnAddstatusModal').html('Update Status');
			},
			error	:  function(error){
					window.location = '/status';
			}
		});
	});
	// handle click event of remove option
	$('#tblStatusDetails').on('click','.btnRemoveStatus',function(){
		var statusID 	= 	$(this).data("id");
		var categoryId  =	$(this).data("catid");
		var languageId  =	$(this).data("langid");
    	bootbox.confirm('Are you really want to delete status ?',function(result){
    		if(result){
    			$.ajax({
    				url		: '/removeStatus/'+statusID+'/'+categoryId+'/'+languageId,
    				type	: 'GET',
    				success	: function(result){
    						window.location = '/status';
    				},
    				error	: function(error){
    						window.location = '/status';
    				}
    			});
    		}
    	});
	});
	$('#drpLanguage').on('change',function(){
		 $('#drpCategory').find('option').remove();
		 $('#drpCategory').append($("<option></option>").attr("value","").text('Select Category'));
		var languageID	= 	$("#drpLanguage option:selected").val();
		$.ajax({
			url		: '/getCategoryDetailsByLanguageID?languageID='+languageID,
			type	: 'GET',
			success	: function(result){
						result.forEach(function(categoryResult){
							$('#drpCategory').append($("<option></option>").attr("value",categoryResult.catId).
								text(categoryResult.catName));
						});
			},
			error	: function(error){
					window.location = '/status';
			}
		});
	});
	//show selected image from user
	function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();            
            reader.onload = function (e) {
                $('#imgStatusImage').attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
	$("#txtImage").change(function(){
        readURL(this);
    });
    // handles change events of status type
    $("#drpStatusType").change(function(){
    	if($("#drpStatusType").val()==2 ){
    		$(".typeText").hide();
    		$(".typeVideo").hide();
    		$(".typeImage").show();
    	}else if($("#drpStatusType").val()==3){
    		$(".typeText").hide();
    		$(".typeImage").hide();    		
    		$(".typeVideo").show();
    	}else{
    		$(".typeText").show();
    		$(".typeImage").hide();
    		$(".typeVideo").hide();    		
    	}
    });
    // Function will open image in modal
    $('#tblStatusDetails').on('click','.statusImage',function(){
    	$(".statusImageClass").attr('src','../Images/status/'+ $(this).data("id"));
		$('#statusImageModal').modal('toggle');
		$('#statusImageModal').modal('show');
		$('#statusImageModal').modal('hide');
    });
    $('#tblStatusDetails').on('click','.statusVideo',function(){    	
    	$(".statusVideoClass").attr('src','../Images/status/'+ $(this).data("id"));
		$('#statusVideoModal').modal('toggle');
		$('#statusVideoModal').modal('show');
		$('#statusVideoModal').modal('hide');
    });
});