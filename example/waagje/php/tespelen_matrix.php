<?php
include './functions.php';
$PDOcon = connectToDatabase();
//Criteria
$where = ['TRUE'];
if (isset($_GET['tafel'])) {
    $where[] = 'SS.TafelNaam IN (' . sanitizeListMysql($_GET['tafel'], $PDOcon) . ')';
}
if (isset($_GET['rooster'])) {
    $where[] = 'SS.v IN (' . sanitizeListMysql($_GET['rooster'], $PDOcon) . ')';
}
$criteria = implode(' AND ', $where);
$sql = <<<EOT
    WITH RECURSIVE seq AS (SELECT 1 AS v UNION ALL SELECT v+1 FROM seq WHERE v<(SELECT waarde FROM Configuratie WHERE naam='maxRooster'))
    SELECT SS.v AS Rooster,SS.TafelNaam,SS.Actief,SS.S1naam,SUM(IF(U.SpelerID1 IS NULL,1,0))-1 AS Number,
        GROUP_CONCAT(IFNULL(IF(SS.S1ID=SS.S2ID,'X',IF(SS.S1ID=U.SpelerID1,U.PartijP1,U.PartijP2)),'-') ORDER BY SS.S2naam SEPARATOR '|') AS results
    FROM (SELECT seq.v,Tafels.TafelNaam,Tafels.ID AS TID,S1.ID AS S1ID, S1.Spelersnaam AS S1naam,S1.Actief,S2.ID AS S2ID, S2.Spelersnaam AS S2naam FROM Spelers S1,Spelers S2,seq,Tafels) SS
    LEFT JOIN Uitslagen U ON (U.SpelerID1,U.SpelerID2) IN ((SS.S1ID,SS.S2ID),(SS.S2ID,SS.S1ID))
        AND U.Seizoen=$thisSeizoenSQL AND U.Rooster=SS.v AND U.TafelID=SS.TID
    WHERE ($criteria)
    GROUP BY SS.v,SS.TafelNaam,SS.S1naam
    ORDER BY SS.v,SS.TafelNaam,SS.S1naam
EOT;
$records = $PDOcon->query($sql)->fetchAll();
header("Content-Type: application/json; charset=UTF-8");
echo json_encode($records);