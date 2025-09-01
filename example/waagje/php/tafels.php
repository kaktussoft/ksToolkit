<?php
include './functions.php';
$PDOcon  = connectToDatabase();
$sql     = "SELECT TafelNaam,Standaardrooster FROM Tafels ORDER BY TafelNaam";
$records = $PDOcon->query($sql)->fetchAll();
echo json_encode($records);