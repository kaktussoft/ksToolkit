<?php
include './functions.php';
$PDOcon = connectToDatabase();
//Criteria
$where = ['TRUE'];
if (isset($_GET['tafel'])) {
    $where[] = 'T.TafelNaam IN (' . sanitizeListMysql($_GET['tafel'], $PDOcon) . ')';
}
if (isset($_GET['rooster'])) {
    $where[] = 'seq.v IN (' . sanitizeListMysql($_GET['rooster'], $PDOcon) . ')';
}
$criteria = implode(' AND ', $where);
$sql = <<<EOT
    WITH RECURSIVE seq AS (SELECT 1 AS v UNION ALL SELECT v+1 FROM seq WHERE v<(SELECT waarde FROM Configuratie WHERE naam='maxRooster'))
    SELECT seq.v AS Rooster,T.TafelNaam,A.SpelersNaam,COUNT(B.SpelersNaam) AS Aantal,GROUP_CONCAT(B.SpelersNaam ORDER BY B.SpelersNaam SEPARATOR '|') AS TeSpelenLijst
    FROM Spelers A,Spelers B,seq,Tafels T
        WHERE A.Actief AND B.Actief
            AND A.ID<>B.ID AND NOT EXISTS (SELECT 1 FROM Uitslagen U WHERE (U.SpelerID1,U.SpelerID2) IN ((A.ID,B.ID),(B.ID,A.ID))
            AND U.TafelID=T.ID AND U.Seizoen=$thisSeizoenSQL AND U.Rooster=seq.v)
            AND ($criteria)
        GROUP BY seq.v,T.TafelNaam,A.SpelersNaam
        ORDER BY seq.v,T.TafelNaam,A.SpelersNaam;
EOT;
$records = $PDOcon->query($sql)->fetchAll();
echo json_encode($records);