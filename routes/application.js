$(document).ready(function() {
	// makes datatable responsive
    $('#tblApplicationDetails').DataTable({
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
    $('#btnAddApplication').click(function(){
        $('#applicationForm').attr('action','/addApplication');
        $('#btnAddCategoryModal').html('Add Application');
    });
    // handle click event of Edit Application Button
    $('.btnApplicationEdit').click(function(){
        var applicatonId = $(this).data("id");
        $('#applicationForm').attr('action','/editApplication?applicatonId='+applicatonId);
        $.ajax({
            url     :'/getApplicationDetailsById?applicatonId='+applicatonId,
            type    : 'GET',
            success :  function(applicationDetails){
                    $('#txtAppName').val(applicationDetails[0].appName);
                    $('#txtAppPackage').val(applicationDetails[0].appPackage);
                    $('#txtAppUrl').val(applicationDetails[0].appUrl);
                    $('#txtAdvId').val(applicationDetails[0].appAdvId);
                    $('#chkAdvId').val() == applicationDetails[0].isAppAdvIdDelete?$('#chkAdvId').prop('checked',true):$('#chkAdvId').prop('checked',false);
                    $('#txtBannerId').val(applicationDetails[0].appAdvBannerId);
                    $('#chkBanId').val() == applicationDetails[0].isAppBanIdDelete?$('#chkBanId').prop('checked',true):$('#chkBanId').prop('checked',false);
                    $('#txtIntId').val(applicationDetails[0].appAdvInterstitialId);
                    $('#chkInsId').val() == applicationDetails[0].isAppInsIdDelete?$('#chkInsId').prop('checked',true):$('#chkInsId').prop('checked',false);
                    $('#txtRewId').val(applicationDetails[0].appAdvRewardId);
                    $('#chkRewId').val() == applicationDetails[0].isAppRewIdDelete?$('#chkRewId').prop('checked',true):$('#chkRewId').prop('checked',false);
                    $('#txtNatId').val(applicationDetails[0].appAdvNativeId);
                    $('#chkNatId').val() == applicationDetails[0].isAppNatIdDelete?$('#chkNatId').prop('checked',true):$('#chkNatId').prop('checked',false);
                    $('#txtAppVersion').val(applicationDetails[0].appVersion);
                    $("input[name='rdbAppStatus'][value="+applicationDetails[0].appStatus+"]").prop('checked',true);
                    $('#btnAddapplicationModal').html('Update Application');
            },
            error   :  function(error){
                     window.location = '/application';
            }
        });
    });
     // handle click event of remove button 
    $('#tblApplicationDetails').on('click', '.btnRemoveApplication', function(){
        var applicatonId = $(this).data("id");
        bootbox.confirm('Are you really want to delete application ?',function(result){
            if(result){
                $.ajax({
                    url     : '/removeApplication?applicatonId='+applicatonId,
                    type    : 'GET',
                    success : function(result){
                            window.location = '/application';
                    },
                    error   : function(error){
                             window.location = '/application';
                    }
                });
            }
        });
    });
});