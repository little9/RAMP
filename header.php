<?php

require_once('autoloader.php');

use RAMP\Util\Database;

include('conf/includes.php');
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"> 
 <style type="text/css">
    .hidden {display:none;}
  </style>
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>
<script type="text/javascript">
    $('html').addClass('hidden');    
    $(document).ready(function() {
        $('html').show();
        $(".modal").colorbox({iframe:true, innerWidth:850, innerHeight:600, frameborder:0});                                   
     });                
</script>    
<script src="script/main.js"></script>
<script src="script/colorbox-master/jquery.colorbox-min.js"></script>
<script src="script/verify.notify.min.js"></script>

<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>
<link rel="shortcut icon" href="style/images/favicon.ico"/>
<script src="//cdnjs.cloudflare.com/ajax/libs/select2/4.0.1/js/select2.min.js"></script>

<link rel="stylesheet" href="//code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css" type="text/css"/>
<link rel="stylesheet" href="style/colorbox-master/example1/colorbox.css" type="text/css"/>
<link href='//fonts.googleapis.com/css?family=Open+Sans:400,300,600' rel='stylesheet' type='text/css'>
<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/pure/0.2.1/pure-min.css">

<link href="//cdnjs.cloudflare.com/ajax/libs/select2/4.0.1/css/select2.min.css" rel="stylesheet" />


</style>

<link rel="stylesheet" type="text/css" href="style/main.css"/>
<title>RAMP editor</title>
<head>
<body>
<header>

<span id="title"></span>



<ul id="menu" class="menu_slice">
	<li><a href="./"><img id="logo" src="style/images/logos-02-01.png" alt="RAMP logo: lowercase sans-serif font with an M that mimics the shape of a skate ramp" title="RAMP homepage"/></a></li>
    <li style="font-style:italic;">prototype</li>
<li id="menu_button">Menu &#9776;</li>
</ul>
<ul id="menu_2" class="menu_slice">
    
	<li id="about_ramp" class="menu_slice"><a href="about.php">About</a></li>
	<li><img class="nav_icon" src="style/images/about_white.png" width="24px" height="24px"></img></li>
	
	<li id="eac_export" class="menu_slice"><a href="export.php">Export</a></li>
	<li><img class="nav_icon" src="style/images/export_white.png" width="24px" height="24px"></img></li>
	<!-- 
	<li id="new_eac" class="menu_slice"><a href="new_eac.php">New</a></li>
	<li><img class="nav_icon" src="style/images/new_white.png" width="24px" height="24px"></img></li>
	-->
	<li id="eac_edit" class="menu_slice"><a href="#">View / Edit</a></li>
	<li><img class="nav_icon" src="style/images/edit_white.png" width="24px" height="24px"></img></li>
	    
	<li id="ead_convert" class='menu_slice'><a href="ead_convert.php">Convert</a></li>
	<li><img class="nav_icon" src="style/images/convert_white.png" width="24px" height="24px"></img></li>		
	
	<li id="ramp_home" class='menu_slice'><a href="index.php">Home</a></li>
	<li><img class="nav_icon" src="style/images/home_white.png" width="24px" height="24px"></img></li>
    
</ul>

<ul id="menu_3" class="menu_slice">
      <li>
<?php
$db = Database::getInstance();
$mysqli = $db->getConnection();

$results = $mysqli->query ("SELECT ead_file, CONCAT(ExtractValue(eac_xml, '//nameEntry[1]/part[1]'),', ',ExtractValue(eac_xml, '//nameEntry[1]/part[2]')) AS 'Name', substring_index(ead_file, '/', -1) AS 'SortHelp'
							FROM eac
							ORDER BY CASE WHEN Name = '' THEN SortHelp ELSE Name END ASC");
echo  "<select class='ead_files '>";
echo "<option>Select a name</option>";
while ($row = $results->fetch_assoc()) {
  $name = $row["Name"];
  $file_name = $row["ead_file"];
  $file_name_display = htmlentities(basename($file_name));
  if($row["Name"]) {
    print "<option value='$file_name'>" . rtrim($name,', ') ."</option>";
  } else {
    print "<option value='$file_name'>$file_name_display</option>";
  }
}
//      foreach ($files as $file) {
//              print ("</option>");
print ("</select>");
?>


     </li>
</ul>
<script type="text/javascript">
  $('select').select2({
	  placeholder: "Select a name",
	  } );
</script>
</header>
<div id="wrap">
<div id="main_content">


