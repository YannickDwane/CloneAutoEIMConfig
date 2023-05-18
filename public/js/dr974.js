$(function() {
  $('.cg974').attr('id','portail-app');
  $('#portail-app h4:first').after('<div class="form-row"><div class="col"><input class="search form-control form-control-sm" placeholder="Rechercher une application" /></div><div class="col"><button class="btn btn-outline-dark fa fa-sort-alpha-asc float-left sort" data-sort="appname"></button></div></div>');
  $('#portail-app .row:first').addClass('list');
	$('#portail-app .sort').click(function() {
	  $(this).toggleClass('fa-sort-alpha-asc');
	  $(this).toggleClass('fa-sort-alpha-desc');
	});
  var userList = new List('portail-app',{valueNames: [ 'appname']});

	var password0 = $('#password0').val();
	if (password0 !== undefined) {
	  if (password0 != "") {
		  $('#oldpassword').val(decodeURIComponent(password0));
			console.log($('#oldpassword').val());
			$("span[trmsg='25']").html('Le nouveau mot de passe que vous avez choisi ne respecte pas les règles de sécurité requises ou l\'ancien mot de passe que vous avez entré est incorrect');
			$("span[trmsg='25']").attr('trmsg','110');
			$("#errormsg div").removeClass("message-warning alert-warning");
			$("#errormsg div").addClass("message-negative alert-danger");
		}
	}
	$('#oldpassword').parent().hide()
});
