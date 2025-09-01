<?php
include './functions.php';
$PDOcon = connectToDatabase();
$PDOcon->exec("set div_precision_increment = 3");
//Criteria
$where = ['TRUE'];
if (isset($_GET['tafel'])) {
    $where[] = 'T.TafelNaam IN (' . sanitizeListMysql($_GET['tafel'], $PDOcon) . ')';
}
if (isset($_GET['rooster'])) {
    $where[] = 'B.Rooster IN (' . sanitizeListMysql($_GET['rooster'], $PDOcon) . ')';
}
$criteria = implode(' AND ', $where);
$sql = <<<EOT
    SELECT T.TafelNaam,B.Rooster,DATE_FORMAT(B.Datum,'%d-%m-%Y') AS DatumF,B.Beurten,A.SpelersNaam AS Speler1,B.CarTeMaken1,B.Car1,
        B.HS1,B.Car1/B.Beurten AS Moy1,B.PartijP1,C.SpelersNaam AS Speler2,B.CarTeMaken2,B.Car2,B.HS2,B.Car2/B.Beurten AS Moy2,B.PartijP2
            FROM Spelers A JOIN Uitslagen B ON A.ID=B.SpelerID1 JOIN Tafels T ON B.TafelID=T.ID JOIN Spelers C ON B.SpelerID2=C.ID
                WHERE B.Seizoen=$thisSeizoenSQL AND :speler IN (A.SpelersNaam,C.SpelersNaam,'Allemaal')
                    AND ($criteria)
                ORDER BY B.Rooster,T.TafelNaam,B.Datum DESC,B.ID DESC
EOT;
$records = $PDOcon->prepare($sql)->custExecute(['speler' => $_GET['speler']])->fetchAll();
echo json_encode(['records' => $records, 'speler' => $_GET['speler']]);