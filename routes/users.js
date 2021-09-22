$(document).ready(function() {
    // makes datatable responsive
    $('#tblUsersDetails').DataTable({
        responsive: true,
        fnRowCallback: function(nRow, aData, iDisplayIndex, iDisplayIndexFull){
            if (aData[2] == "Inactive"){
                $('td', nRow).css('background-color', 'rgb(158, 158, 158)');
            }
        },
        columnDefs: [{
            targets: 1,
            render: function ( data, type, row ) {
                return type === 'display' && data.length > 20 ?
                    data.substr( 0, 50) +'…' :
                    data;
            }
        },
            {responsivePriority: 1, targets: 0},
            {responsivePriority: 10001, targets: 1},
            {responsivePriority: 10001, targets: 2},
        ]
    });
    // makes users log datatable responsive
    $('#tblLogsDetails').DataTable({
        responsive: true,
        columnDefs: [{
            targets: 1,
            render: function ( data, type, row ) {
                return type === 'display' && data.length > 40 ?
                    data.substr( 0, 80) +'…' :
                    data;
            }
        },
            {responsivePriority: 1, targets: 0},
            {responsivePriority: 10001, targets: 1},
            {responsivePriority: 10001, targets: 2},
        ]
    });
    // clear whole modal form value
    $('#usersModal').on('hidden.bs.modal',function(){
        $(this).find('form').trigger('reset');
        $("#lblError").text('');
    });
    // it will show preview of user profile picture    
	function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();            
            reader.onload = function (e) {
                $('#imgProfilePictureTag').attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
    $("#imgProfilePicture").change(function(){
        readURL(this);
    });
    // Disable the Add User Button
    $("#btnAddUserModal").prop('disabled',true);
    function checkPasswordMatch() {
        var password        = $("#txtpassword").val(); 
        var confirmPassword = $("#txtConfirmPassword").val();
        if (password != confirmPassword){
             $("#btnAddUserModal").prop('disabled',true);
            $("#lblError").text("Passwords do not match").css('color','red');
        }
        else{
            $("#lblError").text("Passwords match").css('color','green');
            $("#btnAddUserModal").prop('disabled',false);
        }
    }
   $("#txtConfirmPassword").keyup(checkPasswordMatch);
});