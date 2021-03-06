<?php 
include('header.php');
?>

<div class="pure-g-r">
  <div class="pure-u-1">
	<a href="https://github.com/UMiamiLibraries/RAMP">
	<img style="width:auto; float:right;" src="https://s3.amazonaws.com/github/ribbons/forkme_right_red_aa0000.png" alt="Fork me on GitHub"></a>  	
    <div class="content_box" id="intro_box">
    <h1>Welcome to RAMP</h1>
    <br/>
    <br/>
    <p>The Remixing Archival Metadata Project (RAMP) is a lightweight web-based editing tool that is intended to let users do two things: (1) generate enhanced authority records for creators of archival collections and (2) publish the content of those records as Wikipedia pages.</p>
    <br/>
    <br/>
    <p>The RAMP editor can extract biographical and historical data from <a href="http://www.loc.gov/ead/" target="_blank">EAD finding aids</a> to create new authority records for persons, corporate bodies, and families associated with archival and special collections (using the <a href="http://www3.iath.virginia.edu/eac/cpf/tagLibrary/cpfTagLibrary.html" target="_blank">EAC-CPF format</a>). It can then let users enhance those records with additional data from sources like <a href="http://viaf.org" target="_blank">VIAF</a> and <a href="http://worldcat.org/identities/" target="_blank">WorldCat Identities</a>. Finally, it can transform those records into wiki markup so that users can edit them directly, merge them with any existing Wikipedia pages, and publish them to <a href="http://en.wikipedia.org" target="_blank">Wikipedia</a> through its API.</p>
    <br/>
    <br/>
    <div id="demos">
    <p>Read more about RAMP in <span style="font-style:italic"><a href="http://journal.code4lib.org/articles/8962" target="_blank">Code4Lib Journal</span></a>. Download the source code from <a href="https://github.com/UMiamiLibraries/RAMP" target="_blank">GitHub</a>.</p>
    <br/>
    <p>Watch RAMP demo videos:</p>
    <br/>    
    <p>
    <a id="demo_1" href="http://screencast-o-matic.com/watch/cI6i3JVdFc" class="modal">Overview of the RAMP editor</a> <span> | </span>    
    <a id="demo_3" href="http://screencast-o-matic.com/watch/cI6i3mVdbS" class="modal">Ingesting from WorldCat Identities</a> <span> | </span>        
    <a id="demo_2" href="http://screencast-o-matic.com/watch/cI6i0oVdFl" class="modal">Ingesting from VIAF</a> <span> | </span>    
    <a id="demo_4" href="http://screencast-o-matic.com/watch/cI6i08VdFm" class="modal">Publishing to Wikipedia</a> 
    </p>
    </div>
    </div>   
  </div>
</div>

<div class="pure-g-r" id="box_wrapper">
  <div class="pure-u-1-2">
  <div class="content_box" id="convert_box">
  <img src="style/images/convert.png" alt="Convert" width="24px" height="24px"/>

  <h1>Convert EAD Files into EAC-CPF or Import EAC-CPF Files</h1>
 <ol><li><em>1.</em> Place your files in the 'ead' folder in the RAMP root directory.</li>
  <li><em>2.</em> Click 'Import Files.'  This will transform the EAD files
into EAC-CPF records or import existing EAC-CPF records as-is, storing both original and newly created files in the RAMP database.</li>
<li><em>3.</em> You may now use the RAMP editor to enhance and publish your records. </li>
<br/>
<li>Note: If you run this on a folder that already has files, it will look for new and changed EAC-CPF files. If files
are changed, you will be presented with a 'diff' screen to merge changes. </li></ol>
  <br/>
  <p><a href="ead_convert.php" id="convert_ead">Import Files</a></p>

  <p>
  </p>

  </div>
  </div>


  <div class="pure-u-1-2">
  <div class="content_box" id="edit_box">

 <div id="attribution">
  <img src="http://www.oclc.org/developer/sites/default/files/badges/logo_worldcat_16px.png" width="16" height="16" alt="Some library data on this site is provided by WorldCat, the world's largest library catalog [WorldCat.org]" />
  <p>RAMP contains <a href="http://www.worldcat.org/">OCLC WorldCat</a> information made available under the <a href="http://opendatacommons.org/licenses/by/1.0/">ODC Attribution License</a>. The OCLC Cooperative requests that uses of WorldCat derived data contained in this work conform with the <a href="http://www.oclc.org/worldcat/community/record-use/policy/community-norms.en.html">WorldCat Community Norms</a>.</p>    
</div>
</div>
</div>



  <div class="pure-u-1-2">
  <div class="content_box" id="export_box">
<img src="style/images/export.png" height="24px" width="24px" alt="Export"/>
  <h1>Batch Export EAC-CPF Records</h1>
  <p style="margin:1%; font-size:1.2em;">After your first conversion you can export the resulting EAC-CPF records.</p>
  <br/>
  <p><a id="export_eac" href="export.php" style="margin:1%;">Export EAC-CPF Records</a></p>
  
  </div>
  </div>
  
 

  </div>
  

<?php
 include('footer.php');
?>