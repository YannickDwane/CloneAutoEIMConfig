$(document).ready(function(){
	// Activate tooltip
	$('[data-toggle="tooltip"]').tooltip();
	
	// Select/Deselect checkboxes
	var checkbox = $('table tbody input[type="checkbox"]');
	$("#selectAll").click(function(){
		if(this.checked){
			checkbox.each(function(){
				this.checked = true;                        
			});
		} else{
			checkbox.each(function(){
				this.checked = false;                        
			});
		} 
	});
	checkbox.click(function(){
		if(!this.checked){
			$("#selectAll").prop("checked", false);
		}
	});

	const button = document.querySelector('#stopClone');

	//Déclenche l'affichage de description EIM pour l'édition
	get_EIM_dscription_4_edit();

	//Mettre à jour d'un description EIM
	update_eim_description();

	//Déclenche la recuperation de l'id pour la suppression
	get_EIM_dscription_4_suppr()
});

function get_EIM_dscription_4_edit(){
	$(document).on('click','#editEIM', function(){
		var numInv = $(this).attr('data-id');
		$.ajax(
			{	
				url: 'http://localhost:3000/getEIMDescription',
				method: 'POST',
				contentType: "application/json",
				data: JSON.stringify({param:numInv}),
				success: function(data){
					$('#EditEIMid').val(data.eim_id);
					$('#EditnumInv').val(data.eim_numinv);
					$('#Edithote').val(data.eim_ip);
					$('#Editmdp').val(data.eim_mdp);
				}
			}
		)
	})
}

function update_eim_description(){
	$(document).on('click','#btnModifier', function(){
		var eimId = $('#EditEIMid').val();
		var editNuminv = $('#EditnumInv').val();
		var editHote = $('#Edithote').val();
		var editmdp = $('#Editmdp').val();

		if(editNuminv == ""){
			//traitement
		}else if(editHote == ""){
			//traitement
		}else if(editmdp == ""){
			//traitement
		}else{
			$.ajax({
				url: 'http://localhost:3000/updateEIM/' + eimId,  
				type: 'PUT',
				data: {eim_numinv: editNuminv, eim_ip: editHote, eim_mdp: editmdp},
				success: function(response) {
				  $("#editEIMModal").hide();
				  window.location.href = "http://localhost:3000/";
				},
				error: function(error) {
				  $("#editEIMModal").hide();
				  window.location.href = "http://localhost:3000/";
				}
			  });
		}

	})
}

function get_EIM_dscription_4_suppr(){
	$(document).on('click','#supprimerEIM', function(){
		var numInv = $(this).attr('data-id');
		$.ajax(
			{	
				url: 'http://localhost:3000/getEIMDescription',
				method: 'POST',
				contentType: "application/json",
				data: JSON.stringify({param:numInv}),
				success: function(data){
					$('#SupprEIMNumInv').text(data.eim_numinv);
					$('#SupprEIMid').val(data.eim_id);
				}
			}
		)
	})
}





