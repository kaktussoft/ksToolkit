<?php
include './functions.php';
$PDOcon  = connectToDatabase();
$sql     = "SELECT TafelNaam,Standaardrooster FROM Tafels ORDER BY TafelNaam";
$records = $PDOcon->query($sql)->fetchAll();
header("Content-Type: application/json; charset=UTF-8");
echo json_encode($records);