$(document).ready(function()


		  {
		      //registrer click event that will start viaf ingestion
		      $('#ingest_viaf').on('click', function()
					  
					   {
					       $('.main_edit').hide();
					       					       
					       $('#main_content').prepend('<img id="loading-image" src="style/images/loading.gif" alt="loading"/>');

					       var lstrXML = editor.getValue();

					       //cannot start ingestion without XML being loaded
					       if( lstrXML == '' )
					       {
						   $('body').append("<div id=\"dialog\"><p>Must load EAC first!</p></div>");
						   makeDialog('#dialog', 'Error!'); //display error

						   $('#loading-image').remove();
						   $('.ingest_button').show();

						   $('.main_edit').show();
						   return;
					       }

					       validateXML(function(lboolValid){

						   //xml must be valid in order for viaf ingestion to begin
						   if(lboolValid)
						   {
						       
						       var lobjeac = new eac();
						       lobjeac.loadXMLString( lstrXML );

						       //get first name entry part element in order to get name to search viaf
						       var lobjNameEntryPart = lobjeac.getElement('//*[local-name()=\'cpfDescription\']/*[local-name()=\'identity\']/*[local-name()=\'nameEntry\']/*[local-name()=\'part\']');
						       var eac_name = typeof lobjNameEntryPart.childNodes[0] == 'undefined' ? "" : lobjNameEntryPart.childNodes[0].nodeValue;
						       eac_name = eac_name.trim();
						       eac_name = encode_utf8(eac_name);

						       ingest_viaf_NameEntry_Sources( lobjeac, eac_name, function()
										      {
											  ingest_viaf_Relations(lobjeac, function( lstrMessage ){
											      $('body').append("<div id=\"dialog\"><p>" + lstrMessage + "</p></div>");
											      makeDialog('#dialog', 'Response'); //display response

											      //    $('#loading-image').remove();
											      //commented out by dgonzalez because ingest can be done  multiple times
											      //$('#ingest_viaf').attr("disabled", "disabled");
											    
											      $('.ingest_button').show();
											  });
										      });
						   }else
						   {
						       //display error when xml is not valid
						       $('body').append("<div id=\"dialog\"><p>XML must be valid!</p></div>");
						       makeDialog('#dialog', 'Error!');

						       $('#loading-image').remove();
						       $('.main_edit').show();
						       $('.ingest_button').show();
						   }
					       });
					   });

		      //registrer click event that will start worlcat ingestion
		      $('#ingest_worldcat').on('click', function()

					       {

						   $('.main_edit').hide();
						   
						   $('#main_content').prepend('<img id="loading-image" src="style/images/loading.gif" alt="loading"/>');
						   
						   var lstrXML = editor.getValue();

						   //cannot start ingestion without XML being loaded
						   if( lstrXML == '' )
						   {
						       $('body').append("<div id=\"dialog\"><p>Must load EAC first!</p></div>");
						       makeDialog('#dialog', 'Error!'); //display error

						       $('#loading-image').remove();
						       $('main_edit').show();
						       
						       return;
						   }

						   validateXML(function(lboolValid){

						       //xml must be valid in order for worlcat ingestion to begin
						       if(lboolValid)
						       {
							   
							   var lobjeac = new eac();
							   lobjeac.loadXMLString( lstrXML );

							   //get first name entry part element in order to get name to search viaf
							   var lobjNameEntryPart = lobjeac.getElement('//*[local-name()=\'cpfDescription\']/*[local-name()=\'identity\']/*[local-name()=\'nameEntry\']/*[local-name()=\'part\']');
							   var eac_name = typeof lobjNameEntryPart.childNodes[0] == 'undefined' ? "" : lobjNameEntryPart.childNodes[0].nodeValue;
							   eac_name = eac_name.trim();
							   eac_name = encode_utf8(eac_name);

							   ingest_worldcat_elements( lobjeac, eac_name, function(lstrMessage)
										     {
											 if( typeof lstrMessage != 'undefined' && lstrMessage != '' )
											 {
											     $('body').append("<div id=\"dialog\"><p>" + lstrMessage + "</p></div>");
											     makeDialog('#dialog', 'Response'); //display response
											 }

											 $('#loading-image').remove();
											 $('.ingest_button').show();
											 $('.main_edit').show();
										     });
						       }else
						       {
							   //display error when xml is not valid
							   $('body').append("<div id=\"dialog\"><p>XML must be valid!</p></div>");
							   makeDialog('#dialog', 'Error!');

							   $('#loading-image').remove();
							   $('.main_edit').show();
						       }
						   });
					       });
		  });

/*
 * ingest_viaf_NameEntry_Sources ingest name entries and sources from viaf using API into passed EAC DOM Document. Using passed name to search Viaf.
 * @method ingest_viaf_NameEntry_Sources
 */
function ingest_viaf_NameEntry_Sources( lobjEac, lstrName, callback )
{
    //dialog form to confirm search string to use to search viaf
    $('body').append("<div id=\"dialog-form\" title=\"Viaf Search\"> \
<p class=\"validate-prompt\">Cannot be blank!</p> \
<form> \
<fieldset> \
<label for=\"name\">Name</label> \
<input type=\"text\" name=\"name\" id=\"name\" class=\"text ui-widget-content ui-corner-all\" value=\"" + decode_utf8(lstrName) + "\"/> \
</fieldset> \
</form></div>");

    $('#loading-image').remove();

    

    makePromptDialog('#dialog-form', 'VIAF name search?', function(dialog)
		     {
			 var lstrName = $('input[name="name"]').val();

        		 if(lstrName == '')
        		 {
        		     //need name to continue
        		     $('.validate-prompt').show();
        		 }
        		 else
        		 {
        		     //close dialog
        		     $(dialog).dialog("close");
			     $(dialog).remove();
			     
			  
			     
			     $('#main_content').prepend('<img id="loading-image" src="style/images/loading.gif" alt="loading"/>');

			     lstrName = encode_utf8(lstrName);

			     //post to ajax viaf ingestor controller to search viaf
        		     $.post( 'ajax/viaf_ingest_api.php', { 'action' : 'search', 'name' : lstrName }, function(response)
				     {
					 try
					 {
					     var lobjData = JSON.parse(response);
					 }
					 catch(e) //response should be JSON so if not, throw error
					 {
					     alert(response);
					     callback();

					     return;
					 }

					 display_possible_viaf_form( lobjData, function( lstrChosenViaf )
								     {
									 //if cancelled because no viaf results matched
									 if( lstrChosenViaf == '' )
									 {
									     callback();
									     return;
									 }

									 //post to ajax viaf ingestor controller to get source and name entry nodes from viaf record of chosen result
									 $.post( 'ajax/viaf_ingest_api.php', { 'action' : 'source_and_name_entry', 'viaf_id' : lstrChosenViaf }, function(response)
										 {
										     try
										     {
											 var lobjData = JSON.parse(response);
										     }
										     catch(e) //response should be JSON so if not, throw error
										     {
											 alert(response);
											 callback();

											 return;
										     }

										     var lobjNameEntryList = typeof lobjData.name_entry_list == 'undefined' ? [] : lobjData.name_entry_list;
										     var lobjSource = typeof lobjData.source == 'undefined' ? [] : lobjData.source;

										     for( var i = 0; i < lobjNameEntryList.length; i++ )
										     {
											 var NameEntry = lobjNameEntryList[i];
											 lobjEac.addNameEntry(NameEntry);
										     }

										     lobjEac.addSource( lobjSource );

										     //set ace editor value to new xml from EAC Dom Document with ingested source and name entries
										     editor.getSession().setValue(lobjEac.getXML());

										     callback();
										 });
								     });
    				     });
			 }
		     });
}

/*
 * display_possible_viaf_form displays a form for the editor to choose which viaf results is the correct one from the passed viaf results list
 * @method display_possible_viaf_form
 */
function display_possible_viaf_form( lobjPossibleViaf, callback )
{
    var lstrHTML = "<div class=\"form_container\">";

   
 lstrHTML += "<h2 class=\"instruction\" style=\"font-weight:800; font-size:1.5em;\">Authority Control</h2><p class=\"instruction\">The purpose of this step is to get a unique identifier from the Virtual International Authority File (<a href=\"http://viaf.org\" title=\"Link to the Virtual International Authority File\" target=\"_blank\">VIAF</a>) for the entity you are working with, and then do Named Entity Recognition on the text of the entity's bio or finding aid in order to encode relationships.</p><p class=\"instruction\">The list on the right was retrieved from VIAF. Please examine the name(s) to see whether there is an appropriate match for the entity you are working with.</p><p class=\"instruction\">If you click on a name, you will be taken to its VIAF page, which may include additional information that will help you decide whether it is an appropriate match.</p><p class=\"instruction\">If there is not a good match, click \"Cancel\" to proceed to the next step (Named Entity Recognition).</p>";

    lstrHTML += "<button id=\"ingest_viaf_chosen_viaf\" class=\"pure-button ingest-ok pure-button-secondary\">Use Selected VIAF</button>";
    lstrHTML += "&nbsp;<button id=\"ingest_viaf_chosen_viaf_cancel\" class=\"pure-button ingest-cancel pure-button-secondary\">Cancel</button>";


    lstrHTML += "<div class=\"user_help_form\">";
    lstrHTML += "<h2>Choose the best match for this name:</h2>";

    //go through list and display results as radio buttons for editor to choose
    for(var i = 0; i < lobjPossibleViaf.length; i++)
    {
	var lstrViafID = typeof lobjPossibleViaf[i].viaf_id == 'undefined' ? '' : lobjPossibleViaf[i].viaf_id;
	var lstrName = typeof lobjPossibleViaf[i].name == 'undefined' ? '' : lobjPossibleViaf[i].name;	
	
	lstrHTML += "<input type=\"radio\" name=\"chosen_viaf_id\" value=\"";
	lstrHTML += lstrViafID + "\" /><a href=\"http://viaf.org/viaf/" + lstrViafID + "\" target=\"_blank\">" + lstrName + "</a><br />";
    }



    lstrHTML += "</div></div>";

    $('body').append(lstrHTML);
    jQuery('html,body').animate({scrollTop:0},0); //scroll to top to view form correctly

    //register click event to continue process once user chosesviaf results
    $('#ingest_viaf_chosen_viaf').on('click', function()
				     {
					 var lstrChosenViaf = $('input[name="chosen_viaf_id"]:checked').val();

					 if( typeof lstrChosenViaf == 'undefined')
					 {
					     $('body').append("<div id=\"dialog\"><p>Cannot be blank!</p></div>");
					     makeDialog('#dialog', 'Error!'); // display error
					 }else
					 {
					     $('.form_container').remove();

					     callback(lstrChosenViaf);
					 }
				     });

    //register click event to cancel process
    $('#ingest_viaf_chosen_viaf_cancel').on('click', function()
					    {
						$('.form_container').remove();
						$('.main_edit').show();
						callback('');
					    });
}

/*
 * ingest_viaf_Relations ingest relations from viaf using API into passed EAC DOM Document.
 * @method ingest_viaf_Relations
 */
function ingest_viaf_Relations( lobjEac, callback )
{
    //need to get ead to get possible names and titles list
    $.post( 'ajax/get_ead.php', { 'ead' : getCookie('ead_file_last') }, function(lstrXML)
	    {
		var lobjead = new ead();
		lobjead.loadXMLString( lstrXML );

		var PossibleNameList = [];
		var lobjParagraphList = lobjEac.getParagraph();
		//var lobjSpanList = lobjead.getElementList('//*[local-name()=\'unittitle\']/*[local-name()=\'span\']');
		//lobjSpanList = lobjSpanList.concat(lobjEac.getElementList('//*[local-name()=\'cpfDescription\']/*[local-name()=\'description\']/*[local-name()=\'biogHist\']/*[local-name()=\'p\']//*[local-name()=\'span\']'));
		var lobjUnitTitleList = lobjead.getElementList('//*[local-name()=\'unittitle\']');

		//lobjParagraphList = lobjParagraphList.concat(lobjUnitTitleList);

		for(var i = 0; i < lobjParagraphList.length; i++)
		{
		    if( typeof lobjParagraphList[i].childNodes[0] == 'undefined' )
			continue;

		    var lstrParagraph = lobjParagraphList[i].childNodes[0].nodeValue;

		    if( lstrParagraph == null)
			continue;

		    //apply regex to elements to find all possible names to search viaf for relations
		    //lobjPossibleTitles = lstrParagraph.match(/["\u201D\u201C]([^"\u201D\u201C]+)["\u201D\u201C]/g);
		    //lstrParagraph = lstrParagraph.replace(/["\u201D\u201C]([^"\u201D\u201C]+)["\u201D\u201C]/g, "");
		    var lobjPossibleNames = lstrParagraph.match(/((\sde\s)*?[A-Z\u00C0\u00C1\u00C3\u00C7\u00C9\u00CA\u00CD\u00D3\u00DA\u00DC\u00D4\u00D5\u00D6][a-z\u00E0\u00E1\u00E3\u00E7\u00E9\u00EA\u00ED\u00F0\u00F3\u00F4\u00F5\u00FA\u00FC\u00F1\-']+(\s[0-9][0-9])?([,]*?)(\sde\sla|\sde\s|\sdel|\sde)?\s*([A-Z\u00C1\u00C9\u00CD\u00D3\u00DA\u00DC\u00D6][.]\s*)*(y\sdel\s|y\sde\sla\s|de\sla\s|del\s|de\slos\s|e\s|y\s|de\s)?){2,8}/g);

		    if( lobjPossibleNames != null )
		    {
     			for( var j = 0; j < lobjPossibleNames.length; j++ )
     			{
     			    var lstrPossibleName = lobjPossibleNames[j];
     			    lstrPossibleName = lstrPossibleName.trim();
			    
			    // Strip any trailing commas.
     			    var lstrLastChar = lstrPossibleName.substr( lstrPossibleName.length - 1 );
     			    
     			    if( lstrLastChar == "," )
			    {
				lstrPossibleName = lstrPossibleName.slice(0, -1);
			    }
                            
     			    PossibleNameList.push( lstrPossibleName );
     			}
		    }
		    

		    /*if( lobjPossibleTitles != null )
		      {
		      for( j = 0; j < lobjPossibleTitles.length; j++ )
		      {
		      var lstrPossibleTitle = lobjPossibleTitles[j];
		      lstrPossibleTitle = lstrPossibleTitle.trim();
		      lstrPossibleTitle = lstrPossibleTitle.replace(/["\u201D\u201C]/g, "");
		      lstrPossibleTitle = lstrPossibleTitle.replace(/<span>|<\/span>/g, "");

		      PossibleNameList.push( lstrPossibleTitle );
		      }
		      }*/
		}
		
		
		for(var i = 0; i < lobjUnitTitleList.length; i++)
		{
		    if( typeof lobjUnitTitleList[i].childNodes[0] == 'undefined' )
			continue;

		    var lstrParagraph = lobjUnitTitleList[i].childNodes[0].nodeValue;

		    if( lstrParagraph == null)
			continue;

		    //apply regex to elements to find all possible names to search viaf for relations
		    //lobjPossibleTitles = lstrParagraph.match(/["\u201D\u201C]([^"\u201D\u201C]+)["\u201D\u201C]/g);
		    //lstrParagraph = lstrParagraph.replace(/["\u201D\u201C]([^"\u201D\u201C]+)["\u201D\u201C]/g, "");
		    var lobjPossibleNames = lstrParagraph.match(/((\sde\s)*?[A-Z\u00C0\u00C1\u00C3\u00C7\u00C9\u00CA\u00CD\u00D3\u00DA\u00DC\u00D4\u00D5\u00D6][a-z\u00E0\u00E1\u00E3\u00E7\u00E9\u00EA\u00ED\u00F0\u00F3\u00F4\u00F5\u00FA\u00FC\u00F1\-']+(\s[0-9][0-9])?([,]*?)(\sde\sla|\sde\s|\sdel|\sde)?\s*([A-Z\u00C1\u00C9\u00CD\u00D3\u00DA\u00DC\u00D6][.]\s*)*(y\sdel\s|y\sde\sla\s|de\sla\s|del\s|de\slos\s|e\s|y\s|de\s|[,]\s)?){2,8}/g);

		    if( lobjPossibleNames != null )
		    {
     			for( var j = 0; j < lobjPossibleNames.length; j++ )
     			{
     			    var lstrPossibleName = lobjPossibleNames[j];
     			    lstrPossibleName = lstrPossibleName.trim();
			    
			    // Strip any trailing commas.
     			    var lstrLastChar = lstrPossibleName.substr( lstrPossibleName.length - 1 );
     			    
     			    if( lstrLastChar == "," )
			    {
				lstrPossibleName = lstrPossibleName.slice(0, -1);
			    }
                            
     			    PossibleNameList.push( lstrPossibleName );
     			}
		    }
		    

		    /*if( lobjPossibleTitles != null )
		      {
		      for( j = 0; j < lobjPossibleTitles.length; j++ )
		      {
		      var lstrPossibleTitle = lobjPossibleTitles[j];
		      lstrPossibleTitle = lstrPossibleTitle.trim();
		      lstrPossibleTitle = lstrPossibleTitle.replace(/["\u201D\u201C]/g, "");
		      lstrPossibleTitle = lstrPossibleTitle.replace(/<span>|<\/span>/g, "");

		      PossibleNameList.push( lstrPossibleTitle );
		      }
		      }*/
		}
		
		

		/*for(var i = 0; i < lobjSpanList.length; i++)
		  {
		  var lstrPossibleTitle = lobjSpanList[i].childNodes[0].nodeValue;

		  if( lstrPossibleTitle == null)
		  continue;

		  lstrPossibleTitle = lstrPossibleTitle.trim();
		  PossibleNameList.push(lstrPossibleTitle);
		  }*/

		PossibleNameList = unique(PossibleNameList);
		PossibleNameList.sort();

		if(PossibleNameList.length == 0)
		{
		    callback( 'No matches for possible names found!' );

		    return;
		}

		//display all possible names for editor to choose correct/desired names to search viaf and create relations
		display_possible_name_form(PossibleNameList, function( lobjChosenNames )
					   {
					       if( lobjChosenNames.length == 0 )
					       {
						   callback("Done!"); //done if no names where chosen
						   $('.viaf_arrow').html("&#10003;");
						   $('#loading-image').remove();
						   $('.main_edit').show();
						   return;
					       }

					       var ljsonChosenNames = JSON.stringify(lobjChosenNames);

					       //post to ajax viaf ingestor controller to get relation nodes from viaf based on posted lists
					       $.post( 'ajax/viaf_ingest_api.php', { 'action' : 'relations', 'chosen_names' : ljsonChosenNames }, function(response)
						       {
							   try
							   {
							       var lobjData = JSON.parse(response);
							   }
							   catch(e) //response should be JSON so if not, throw error
							   {
							       alert(response);
							       $('#loading-image').remove();
							       //commented out by dgonzalez because ingest can be done multiple times
							       //$('#ingest_viaf').attr("disabled", "disabled");
							       //  $('.ingest_button').show();
							       $('.viaf_arrow').html("&#10003;");
							       
							       
							       return;
							   }

							   //display results from viaf realtion nodes search so editor can choose which relations they want to ingest
							   display_viaf_results_form(lobjData, function( lobjResultsChosen )
										     {
											 if( lobjResultsChosen.length == 0 )
											 {
											     callback("Done!"); //finish process if no results chosen
											     $('.viaf_arrow').html("&#10003;");
											     $('#loading-image').remove(); 
											     $('main_edit').show();
											     return;
											 }

											 //ingest into EAC all chosen results from viaf
											 for(var i = 0; i < lobjResultsChosen.length; i++)
											 {
											     var chosen_result = lobjResultsChosen[i];

											     lobjEac.addCPFRelation(lobjData[chosen_result]);
											 }

											 editor.getSession().setValue(lobjEac.getXML());

											 callback("Done!");
											 $('.viaf_arrow').html("&#10003;");
											 
											 $('#loading-image').remove();
											 $('.main_edit').show();
										     });
						       });
					   });
	    });
}

/*
 * display_possible_name_form displays a form for the editor to choose which names to search viaf to create realtions.
 * @method display_possible_name_form
 */
function display_possible_name_form( lobjPossibleNames, callback )
{
    var lstrHTML = "<div class=\"form_container\">";
 
    lstrHTML += "<h2 class=\"instruction\" style=\"font-weight:800; font-size:1.5em;\">Named Entity Recognition</h2><p class=\"instruction\">These names have been extracted from this entity\'s finding aid or biography. Select additional names that you would like to look up in VIAF.</p><p class=\"instruction\">Note that geographical places are not included in VIAF and so should be skipped at this stage.</p><p class=\"instruction\">Each name can be edited to improve the search query, if appropriate. If names need to be split, or if you have additional names to add, you may click \"Add New Row\" to input appropriate data. It is best to enter new names where they would appear in alphabetical order (by first name).</p><p class=\"instruction\" style=\"font-style:italic\">Please note that if you select several names to look up in VIAF, your query may take a few seconds to run.</p><p class=\"instruction\">These names will be used to create &lt;cpfRelation&gt; elements, with associated VIAF IDs, in the EAC-CPF record.</p>";


    lstrHTML += "<button id=\"ingest_viaf_chosen_names_relations\" class=\"pure-button ingest-ok pure-button-secondary\">Use Selected Names</button>";
    lstrHTML += "&nbsp;<button id=\"ingest_viaf_chosen_names_relations_cancel\" class=\"pure-button ingest-cancel pure-button-secondary\">Cancel</button>";


    lstrHTML += "<div class=\"user_help_form\">";

    lstrHTML += "<h2>Please choose names to create &lt;cpfRelation&gt; elements:</h2>";
    lstrHTML += "<input type=\"checkbox\" id=\"select_all\" value=\"\"><span style=\"font-weight:800; margin-left:4px;\">Select all</span><br />";

     // HTML modified by timathom to allow users to edit Named Entity Recognition results.
    lstrHTML += "<table class=\"user_help_form_table\"><tr>";
    
    for(var i = 0; i < lobjPossibleNames.length; i++)
    {                
    	lstrHTML += "<td><input type=\"checkbox\" class=\"ner_check\" name=\"chosen_names\" value=\"\"/></td>";
    	lstrHTML += "<td><input type=\"text\" class=\"ner_text\" name=\"modified_names\" size=\"40\" value=\"" + lobjPossibleNames[i] + "\"/></td>";
        lstrHTML += "<td><input type=\"button\" name=\"add\" value=\"Add New Row\" class=\"ner_empty_add pure-button pure-button-secondary\"/></td></tr>";	
    }

    lstrHTML += "</tr></table>"

    lstrHTML += "</div></div>";

    $('body').append(lstrHTML);

    // jQuery added by timathom to include "Add New Row" and "Delete Row" buttons and functionality.
 			    $("input.ner_empty_add").on('click', function() {        
 			        var tr = "<tr><td><input type=\"checkbox\" class=\"ner_check\" name=\"chosen_names\" value=\"\"/></td><td><input type=\"text\" class=\"ner_text\" name=\"modified_names\" size=\"40\" value=\"\" /></td><td><input type=\"button\" name=\"rm\" value=\"Delete Row\" class=\"ner_empty_rm pure-button pure-button-secondary\"/></td></tr>";         
 			        $(this).closest("tr").after(tr);
 			        
 			        $("input.ner_empty_rm").on('click', function() {        
 			            $(this).closest("tr").remove();
 		            });        
 			    });

    setupSelectAll('input#select_all'); //able to select all checkboxes
    jQuery('html,body').animate({scrollTop:0},0); //scroll to top to view form correctly

    //register click event to continue process once user choses names
    $('#ingest_viaf_chosen_names_relations').on('click', function()
						{
						    var lobjChosenNames = [];

						    $('input.ner_check').each(function () {
							if(this.checked)
     							{
     					           lobjChosenNames.push(encode_utf8($(this).closest('td').next('td').children('input').val())); 
     							}        	     							
						    });				
						    if ( lobjChosenNames == '' )
						    {
						        $('body').append("<div id=\"dialog\"><p>Cannot be blank!</p></div>");
					            makeDialog('#dialog', 'Error!'); // display error
						        //$('.main_edit').hide();   
						    }
						    else
						    {						                                          
      						    callback(lobjChosenNames);	
      						    $('.form_container').remove();
      						    $('.main_edit').hide();
						    }						   						    											    			
						});

    //register click event to cancel process
    $('#ingest_viaf_chosen_names_relations_cancel').on('click', function()
						       {
							   var lobjChosenNames = [];

							   $('.form_container').remove();

							   callback(lobjChosenNames);
						       });
}

/*
 * display_viaf_results_form displays a form for the editor to choose which viaf results that editor wants to ingest as realtions
 * @method display_viaf_results_form
 */
function display_viaf_results_form( lobjViafResults, callback )
{
    var lstrHTML = "<div class=\"form_container\">";
 lstrHTML += "<h2 class=\"instruction\" style=\"font-weight:800; font-size:1.5em;\">Named Entity Recognition</h2><p class=\"instruction\">Based on your selections, these are the possible matches we were able to retrieve from VIAF. Results are sorted by how many individual holdings are associated with each name in the VIAF database.</p><p class=\"instruction\">Please note that you will need to verify these results. The first name listed for each entity may not be a correct match. When there are several possibilities, you may need to look at each one before choosing.</p><p class=\"instruction\">Some results are obviously unrelated, but others may be harder to differentiate. Be aware that even if a name seems to match your original selection, it may be a false hit.</p><p class=\"instruction\">When in doubt, please click on a name to visit its VIAF page and look for additional information. If a name already has a corresponding Wikipedia article (there may be a link from the VIAF page), check there to see which VIAF ID has been used, and then select the name that corresponds to that VIAF ID.</p>"
   
     lstrHTML += "<button id=\"ingest_viaf_add_relations\" class=\"pure-button ingest-ok pure-button-secondary\">Use Selected Results</button>";
    lstrHTML += "&nbsp;<button id=\"ingest_viaf_add_relations_cancel\" class=\"pure-button ingest-cancel pure-button-secondary\">Cancel</button>";

    lstrHTML += "<div class=\"user_help_form\">";

   lstrHTML += "<h2>Please choose appropriate matches from VIAF (the original string you searched for appears first, before the colon):</h2>";
    lstrHTML += "<input type=\"checkbox\" id=\"select_all\" value=\"\"><span style=\"font-weight:800; margin-left:4px;\">Select all</span><br />";

    for( var lstrName in lobjViafResults )
    {
	lstrHTML += "<input type=\"checkbox\" name=\"chosen_results\" value=\"";
	lstrHTML += lstrName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') + "\" /> " + lstrName + "<br />";
    }


    lstrHTML += "</div></div>";

    $('body').append(lstrHTML);
    setupSelectAll('input#select_all'); //functionality to select all checkboxes
    jQuery('html,body').animate({scrollTop:0},0); //scroll to top to view form correctly

    //register click event to continue process once user choses results
    $('#ingest_viaf_add_relations').on('click', function()
				       {
					   var lobjChosenResults = [];

					   $('input[name="chosen_results"]').each(function () {
					       if(this.checked)
					       {
						   lobjChosenResults.push($(this).val());
					       }
					   });
					   if ( lobjChosenResults == '' )
						    {
						        $('body').append("<div id=\"dialog\"><p>Cannot be blank!</p></div>");
					            makeDialog('#dialog', 'Error!'); // display error
						        //$('.main_edit').hide();   
						    }
						    else
						    {						                                          
      						    $('.form_container').remove();
					           callback(lobjChosenResults);
						    }					   
				       });

    //register click event to cancel process
    $('#ingest_viaf_add_relations_cancel').on('click', function()
					      {
						  var lobjChosenResults = [];

						  $('.form_container').remove();

						  callback(lobjChosenResults);
						  
						  $('.main_edit').show();
						  
					      });
}

/*
 * ingest_worldcat_elements ingest subject headings and relationships from worldcat using API into passed EAC DOM Document.
 * @method ingest_worldcat_elements
 */
function ingest_worldcat_elements( lobjEac, lstrName, callback )
{
    $('body').append("<div id=\"dialog-form\" title=\"WorldCat Search\"> \
<p class=\"validate-prompt\">Cannot be blank!</p> \
<form> \
<fieldset> \
<label for=\"name\">Name</label> \
<input type=\"text\" name=\"name\" id=\"name\" class=\"text ui-widget-content ui-corner-all\" value=\"" + decode_utf8(lstrName) + "\"/> \
</fieldset> \
</form></div>");

    $('#loading-image').remove();
    $('.ingest_button').show();

    //prompt user to enter search string for WorldCat search
    makePromptDialog('#dialog-form', 'WorldCat name search?', function(dialog)
		     {
			 var lstrName = $('input[name="name"]').val();

        		 if(lstrName == '')
        		 {
        		     $('.validate-prompt').show();
        		 }
        		 else
        		 {
        		     //  $('.ingest_button').hide();
		    	     //  $('#save_eac').hide();
			     //  $('#convert_to_wiki').hide();
			     
			     $('#main_content').prepend('<img id="loading-image" src="style/images/loading.gif" alt="loading"/>');
			     $(dialog).dialog("close");
			    
			     lstrName = encode_utf8(lstrName);

			     //post to ajax WorldCat ingestor controller to search worldcat and get results
        		     $.post( 'ajax/worldcat_ingest_api.php', { 'action' : 'search', 'name' : lstrName }, function(response)
				     {
					 try
					 {
					     var lobjData = JSON.parse(response);
					 }
					 catch(e) //response should be JSON so if not, throw error
					 {
					     //alert(response);
					     callback(response);
					     $(dialog).dialog("close");
					     $('.main_edit').show();
					     
					     return;
					 }

					 //display form for editor to choose which WorldCat result is the correct result
					 display_possible_worldcat_form( lobjData, function( lstrChosenURI )
									 {
									     //if cancelled because no viaf results matched
									     if( lstrChosenURI == '' )
									     {
										 callback();
										 return;
									     }

									     //post to ajax WorldCat ingestor controller to search worldcat and get results
									     $.post( 'ajax/worldcat_ingest_api.php', { 'action' : 'get_element_list', 'uri' : lstrChosenURI }, function(response)
										     {
											 try
											 {
											     var lobjData = JSON.parse(response);
											 }
											 catch(e) //response should be JSON so if not, throw error
											 {
											     alert(response);
											     callback();
											     $(dialog).dialog("close");
											     $('.main_edit').show();
											     return;
											 }

											 var lobjCpfRelationList = typeof lobjData.cpfRelation == 'undefined' ? [] : lobjData.cpfRelation;
											 var lobjResourceRelationList = typeof lobjData.resourceRelation == 'undefined' ? [] : lobjData.resourceRelation;
											 var lobjSubjectList = typeof lobjData.subject == 'undefined' ? [] : lobjData.subject;

											 for( var i = 0; i < lobjCpfRelationList.length; i++ )
											 {
											     var CpfRelation = lobjCpfRelationList[i];
											     lobjEac.addCPFRelation(CpfRelation);
											 }

											 for( i = 0; i < lobjResourceRelationList.length; i++ )
											 {
											     var ResourceRelation = lobjResourceRelationList[i];
											     lobjEac.addResourceRelation(ResourceRelation);
											 }

											 //display form for editor to chose which subject headings to ingest
											 display_possible_worldcat_subjects( lobjSubjectList, function( lobjChosenSubjects )
															     {
																 for( i = 0; i < lobjChosenSubjects.length; i++ )
																 {
																     var Subject = lobjSubjectList[lobjChosenSubjects[i]];
																     lobjEac.addSubjectHeading(Subject);
																 }

																 editor.getSession().setValue(lobjEac.getXML());

																 callback('Done!');
																 $('#loading-image').remove();
																 $('.worldcat_arrow').html("&#10003;");
																 //	 $('.arrows').show();
																 //	 $('#save_eac').show();

																 
																 //	 $('#convert_to_wiki').show();
																 $('main_edit').show();
															     });
										     });
									 });

	        			 $(dialog).dialog("close");
					 $('.main_edit').show();
	            			 $(dialog).remove();
    				     });
			 }
		     });
}

/*
 * display_possible_worldcat_form displays a form for the editor to choose which worldcat results that editor wants to ingest
 * @method display_possible_worldcat_form
 */
function display_possible_worldcat_form( lobjPossibleURI, callback )
{
    var lstrHTML = "<div class=\"form_container\">";

 lstrHTML += "<h2 class=\"instruction\" style=\"font-weight:800; font-size:1.5em;\">Additional Data Extraction</h2><p class=\"instruction\">This step draws on <a href=\"http://worldcat.org/identities/\" title=\"Link to WorldCat Identities\" target=\"_blank\">WorldCat Identities</a> to pull in a variety of data (works by, works about, related entities, and subject headings) associated with the entity you are working with.</p><p class=\"instruction\">The names to the right represent possible matches from WorldCat Identities. Please examine them to select the best match for the current entity.</p><p class=\"instruction\">If you click on a name, you will be taken to its WorldCat Identities page, which may include additional information that will help you decide whether it is an appropriate match. In general, the page with the most information will be the best match.</p>";


    lstrHTML += "<button id=\"ingest_worldcat_chosen_uri\" class=\"pure-button ingest-ok pure-button-secondary\">Use Selected WorldCat</button>";
    lstrHTML += "&nbsp;<button id=\"ingest_worldcat_chosen_uri_cancel\" class=\"pure-button ingest-cancel pure-button-secondary\">Cancel</button>";

    lstrHTML += "<div class=\"user_help_form\">";

    lstrHTML += "<h2>Please choose the name that is the best match:</h2>";

    for(var i = 0; i < lobjPossibleURI.length; i++)
    {
	var lstrTitle = typeof lobjPossibleURI[i].title == 'undefined' ? '' : lobjPossibleURI[i].title;
	var lstrURI = typeof lobjPossibleURI[i].uri == 'undefined' ? '' : lobjPossibleURI[i].uri;
	var lstrType = typeof lobjPossibleURI[i].type == 'undefined' ? '' : lobjPossibleURI[i].type;

	lstrHTML += "<input type=\"radio\" name=\"chosen_worldcat_uri\" value=\"";
	lstrHTML += lstrURI + "\" /><a href=\"" + lstrURI + "\" target=\"_blank\">" + lstrTitle + "</a><br />";
    }


    lstrHTML += "</div></div>";

    $('body').append(lstrHTML);
    jQuery('html,body').animate({scrollTop:0},0); //scroll to top to view form correctly

    //register click event to continue process once user choses result
    $('#ingest_worldcat_chosen_uri').on('click', function()
					{
					    var lstrChosenURI = $('input[name="chosen_worldcat_uri"]:checked').val();

					    if( typeof lstrChosenURI == 'undefined')
					    {
						$('body').append("<div id=\"dialog\"><p>Cannot be blank!</p></div>");
						makeDialog('#dialog', 'Error!');
					    }else
					    {
						$('.form_container').remove();

						callback(lstrChosenURI);
					    }
					});

    //register click event to cencel process
    $('#ingest_worldcat_chosen_uri_cancel').on('click', function()
					       {
						   $('.form_container').remove();
						   
						   callback('');
					       });
}

/*
 * display_possible_worldcat_subjects displays a form for the editor to choose which worldcat subject headings that editor wants to ingest
 * @method display_possible_worldcat_subjects
 */
function display_possible_worldcat_subjects( lobjPossibleSubjects, callback )
{
    var lstrHTML = "<div class=\"form_container\">";
 lstrHTML += "<h2 class=\"instruction\" style=\"font-weight:800; font-size:1.5em;\">Additional Data Extraction</h2><p class=\"instruction\">Here is a list of FAST subject headings from this entity's WorldCat Identities page. Select appropriate headings to add to your EAC-CPF record.</p>";
 
lstrHTML += "<button id=\"ingest_worldcat_chosen_subjects\" class=\"pure-button pure-button-secondary\">Use Selected Subjects</button>";

lstrHTML += "&nbsp;<button id=\"ingest_worldcat_chosen_subjects_cancel\" class=\"pure-button pure-button-secondary\">Cancel</button>";  

    lstrHTML += "<div class=\"user_help_form\">";

    lstrHTML += "<h2>Please choose any appropriate subjects related to this entity:</h2>";
    
    lstrHTML += "<input type=\"checkbox\" id=\"select_all\" value=\"\"><span style=\"font-weight:800; margin-left:4px;\">Select all</span><br />";

    for(var i = 0; i < lobjPossibleSubjects.length; i++)
    {
	lstrHTML += "<input type=\"checkbox\" name=\"chosen_subjects\" value=\"";
	lstrHTML += i + "\" /> " + lobjPossibleSubjects[i].elements.term.elements + "<br />";
    }


    lstrHTML += "</div></div>";

    $('body').append(lstrHTML);
    setupSelectAll('input#select_all'); //setup to select all checkboxes
    jQuery('html,body').animate({scrollTop:0},0); //scroll to top to view form correctly

    //register click event to continue process once user choses subjects
    $('#ingest_worldcat_chosen_subjects').on('click', function()
					     {
						 var lobjChosenSubjects = [];

						 $('input[name="chosen_subjects"]').each(function () {
						     if(this.checked)
						     {
							 lobjChosenSubjects.push($(this).val());
						     }
						 });

						 $('.form_container').remove();

						 callback(lobjChosenSubjects);
					     });

    //register click event to cencel process
    $('#ingest_worldcat_chosen_subjects_cancel').on('click', function()
						    {
							var lobjChosenSubjects = [];

							$('.form_container').remove();
							


							callback(lobjChosenSubjects);
						    });
}

/*
 * setupSelectAll registers passed element selector's change event in order to have check all visible checkboxes functionality.
 * @method setupSelectAll
 */
function setupSelectAll( lstrSelector )
{
    $(lstrSelector ).change( function()
			     {
				 if( $(lstrSelector).prop("checked") == true )
				     $('input[type="checkbox"]:visible').prop('checked', true);
				 else
				     $('input[type="checkbox"]:visible').prop('checked', false);
			     })
}
