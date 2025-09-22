<?php
include './functions.php';
$PDOcon = connectToDatabase();

$extra = '';
if (isset($_GET['speler'])) {
    $extra = "AND B.SpelersNaam={$PDOcon->quote($_GET['speler'])}";
}
$sql = <<<EOT
    SELECT DISTINCT A.SpelersNaam FROM Spelers A,Spelers B,Tafels T
    WHERE T.TafelNaam=:tafel AND A.Actief AND B.Actief
        AND A.ID<>B.ID AND NOT EXISTS (SELECT 1 FROM Uitslagen U WHERE (U.SpelerID1,U.SpelerID2) IN ((A.ID,B.ID),(B.ID,A.ID))
        AND TafelID=T.ID AND Seizoen=$thisSeizoenSQL AND U.Rooster=:rooster)
        $extra
    ORDER BY A.SpelersNaam
EOT;
$records = $PDOcon->prepare($sql)->custExecute(['tafel' => $_GET['tafel'], 'rooster' => $_GET['rooster']])->fetchAll();
header("Content-Type: application/json; charset=UTF-8");
echo json_encode($records);