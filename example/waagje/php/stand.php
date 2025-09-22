<?php
include './functions.php';
$PDOcon = connectToDatabase();
$PDOcon->exec("set div_precision_increment = 3");
//Criteria
$where = ['TRUE'];
if (isset($_GET['tafel'])) {
    $where[] = 'X.TafelNaam IN (' . sanitizeListMysql($_GET['tafel'], $PDOcon) . ')';
}
if (isset($_GET['rooster'])) {
    $where[] = 'X.v IN (' . sanitizeListMysql($_GET['rooster'], $PDOcon)  . ')';
}
$criteria = implode(' AND ', $where);
$sql = <<<EOT
    WITH RECURSIVE seq AS (SELECT 1 AS v UNION ALL SELECT v+1 FROM seq WHERE v<(SELECT waarde FROM Configuratie WHERE naam='maxRooster'))
        SELECT X.v AS Rooster,X.TafelNaam,
            RANK() OVER(PARTITION BY X.v,X.TID ORDER BY O.sumPartijP DESC,O.AantalPar,X.Moyenne DESC) AS Pl,X.Actief,
            X.SpelersNaam,X.Moyenne,X.Car,O.sumCar/O.sumBeurten AS GespMoy, Caramboles(O.sumCar/O.sumBeurten) AS newCar,
            O.sumCar,O.sumBeurten,O.maxHS,O.minBeurten,O.maxBeurten,
            O.maxMoy,O.minMoy,O.AantalPar,O.sumPartijP
        FROM (SELECT Rooster,TafelID,
            SpelerID,SUM(Car) AS sumCar,SUM(Beurten) AS sumBeurten,
            MAX(HS) AS maxHS,MIN(IF(Car=CarTeMaken,Beurten,NULL)) AS minBeurten,MAX(Beurten) AS maxBeurten,
            MAX(Car/Beurten) AS maxMoy,MIN(Car/Beurten) AS minMoy,
            COUNT(*) AS AantalPar,SUM(PartijP) AS sumPartijP
                FROM SpelersOverzicht WHERE Seizoen=$thisSeizoenSQL GROUP BY Rooster,TafelID,SpelerID) O
        RIGHT JOIN (SELECT * FROM (SELECT seq.v,S.Actief,S.ID AS SID,T.ID AS TID,S.SpelersNaam,T.TafelNaam FROM Spelers S,Tafels T,seq) STR
        LEFT JOIN Moyennes M ON STR.v=M.Rooster AND STR.SID=M.SpelerID AND STR.TID=M.TafelID) X ON O.Rooster=X.v AND O.SpelerID=X.SID AND O.TafelID=X.TID
            WHERE ($criteria)
            ORDER BY X.v,X.TafelNaam,Pl,X.SpelersNaam
EOT;
$records = $PDOcon->query($sql)->fetchAll();
header("Content-Type: application/json; charset=UTF-8");
echo json_encode($records);