<?php
include './functions.php';
$PDOcon = connectToDatabase();
$PDOcon->exec("set div_precision_increment = 3");
$dynamicSql = function ($value) {
    $MoySQL = <<<EOT
    JOIN (SELECT SpelerID,Moy AS Moy{$value['ID']},Car AS Car{$value['ID']} FROM cte1
        WHERE TafelID={$value['ID']}) Tab_cte1_{$value['ID']}
        ON S.ID=Tab_cte1_{$value['ID']}.SpelerID
    EOT;
    $PPSQL = <<<EOT
    JOIN (SELECT SpelerID,AantalPar AS AantalPar{$value['ID']},sumPartijP AS sumPartijP{$value['ID']} FROM cte2
        WHERE TafelID={$value['ID']}) Tab_cte2_{$value['ID']}
        ON S.ID=Tab_cte2_{$value['ID']}.SpelerID
    EOT;
    $GeschMoySQL = <<<EOT
    JOIN (SELECT SpelerID,GMoy AS GMoy{$value['ID']},GCar AS GCar{$value['ID']} FROM cte3
        WHERE TafelID={$value['ID']}) Tab_cte3_{$value['ID']}
        ON S.ID=Tab_cte3_{$value['ID']}.SpelerID
    EOT;
    return "$MoySQL $PPSQL $GeschMoySQL";
};
$seizoen     = $PDOcon->query("SELECT waarde FROM Configuratie WHERE naam='Seizoen'")->fetchColumn();
$Tafels      = $PDOcon->query("SELECT ID,TafelNaam FROM Tafels ORDER BY TafelNaam")->fetchAll();
$dynamic_sql = implode(' ', array_map($dynamicSql, $Tafels));
$SpelerIDEnTafelID = 'B.SID AS SpelerID,B.TID AS TafelID';
$RightJoinAlleSpelerIDsTafelIDs = 'RIGHT JOIN (SELECT S.ID AS SID,T.ID AS TID FROM Spelers S,Tafels T) B ON A.SpelerID=B.SID AND A.TafelID=B.TID)';
$sql = <<<EOT
    WITH MoyMaxRooster AS (SELECT M.TafelID,M.SpelerID,M.Moyenne,M.Car FROM Moyennes M
        JOIN (SELECT TafelID,SpelerID,MAX(Rooster) AS maxRooster FROM Moyennes WHERE Moyenne IS NOT NULL GROUP BY TafelID,SpelerID) MP
            ON M.Rooster=MP.maxRooster AND M.TafelID=MP.TafelID AND M.SpelerID=MP.SpelerID),

    SpelersOverzichtLaatste2Roosters AS (SELECT SO.* FROM SpelersOverzicht SO
        JOIN (SELECT *,ROW_NUMBER() OVER(PARTITION BY X.TafelID ORDER BY X.Seizoen DESC,X.Rooster DESC) AS rownum FROM
            (SELECT DISTINCT U.TafelID,U.Seizoen,U.Rooster FROM Uitslagen U
        JOIN Tafels T ON U.TafelID=T.ID WHERE U.Seizoen!=$thisSeizoenSQL OR U.Rooster<=T.standaardrooster) X) Y
            ON SO.Seizoen=Y.Seizoen AND SO.TafelID=Y.TafelID AND SO.Rooster=Y.Rooster WHERE Y.rownum<=2),

    cte1 AS (SELECT $SpelerIDEnTafelID,A.Moyenne AS Moy,A.Car FROM MoyMaxRooster A
        $RightJoinAlleSpelerIDsTafelIDs,

    cte2 AS (SELECT $SpelerIDEnTafelID,A.AantalPar,A.sumPartijP
        FROM (SELECT TafelID,SpelerID,COUNT(*) AS AantalPar,SUM(PartijP) AS sumPartijP FROM SpelersOverzicht WHERE Seizoen='$seizoen' GROUP BY TafelID,SpelerID) A
        $RightJoinAlleSpelerIDsTafelIDs,

    cte3 AS (SELECT $SpelerIDEnTafelID,A.GMoy,A.GCar
        FROM (SELECT TafelID,SpelerID,SUM(Car)/SUM(Beurten) AS GMoy, Caramboles(SUM(Car)/SUM(Beurten)) AS GCar
            FROM SpelersOverzichtLaatste2Roosters GROUP BY TafelID,SpelerID) A
        $RightJoinAlleSpelerIDsTafelIDs

    SELECT * FROM Spelers S {$dynamic_sql}
    JOIN (SELECT SpelerID,RANK() OVER(ORDER BY SUM(sumPartijP) DESC,SUM(AantalPar)) AS Pl,SUM(AantalPar) AS AantalParTot,SUM(sumPartijP) AS PartijPTot FROM cte2 GROUP BY SpelerID) X
        ON S.ID=X.SpelerID
    ORDER BY X.Pl,S.SpelersNaam
EOT;
$sql_statistieken = <<<EOT
    WITH RECURSIVE seq AS (SELECT 1 AS v UNION ALL SELECT v+1 FROM seq WHERE v<(SELECT waarde FROM Configuratie WHERE naam='maxRooster'))
        ,cte1a AS (SELECT B.Pl,A.v AS Rooster,A.TID AS TafelID,SpelersNaam
            FROM (SELECT seq.v,T.ID AS TID,S.ID AS SID,SpelersNaam FROM seq,Tafels T,Spelers S) A
            JOIN (SELECT SO.SpelerID,SO.Rooster,SO.TafelID,RANK() OVER(PARTITION BY SO.Rooster,SO.TafelID
                ORDER BY SUM(PartijP) DESC,COUNT(*),M.Moyenne DESC) AS Pl,COUNT(*) AS AantalPar,SUM(PartijP) AS sumPartijP FROM SpelersOverzicht SO JOIN Moyennes M
                    ON SO.SpelerID=M.SpelerID AND SO.TafelID=M.TafelID AND SO.rooster=M.Rooster WHERE Seizoen=$thisSeizoenSQL
                        GROUP BY Rooster,TafelID,SpelerID) B ON A.v=B.Rooster AND A.TID=B.TafelID AND A.SID=B.SpelerID WHERE B.Pl=1)

        ,cte1 AS (SELECT X.*,GROUP_CONCAT(cte1a.SpelersNaam ORDER BY cte1a.SpelersNaam SEPARATOR '|') AS Nummer1 FROM (SELECT seq.v AS Rooster,T.TafelNaam,T.ID AS TID,T.standaardRooster FROM seq,Tafels T) X
            LEFT JOIN cte1a ON X.Rooster=cte1a.Rooster AND X.TID=cte1a.TafelID GROUP BY X.Rooster,X.Tafelnaam)

        ,cte2a AS (SELECT B.Pl,A.v AS Rooster,A.TID AS TafelID,SpelersNaam,HS
            FROM (SELECT seq.v,T.ID AS TID,S.ID AS SID,SpelersNaam FROM seq,Tafels T,Spelers S) A
            JOIN (SELECT SO.SpelerID,SO.TafelID,SO.Rooster,RANK() OVER(PARTITION BY SO.Rooster,SO.TafelID
                ORDER BY SO.HS DESC,SO.Datum,SO.ID) AS Pl,HS FROM SpelersOverzicht SO WHERE Seizoen=$thisSeizoenSQL) B
                    ON A.v=B.Rooster AND A.TID=B.TafelID AND A.SID=B.SpelerID WHERE B.Pl=1)

        ,cte2 AS (SELECT X.*,GROUP_CONCAT(SpelersNaam ORDER BY SpelersNaam SEPARATOR '|') AS SpelerHS,ANY_VALUE(HS) AS HS FROM (SELECT seq.v AS Rooster,T.TafelNaam,T.ID AS TID FROM seq,Tafels T) X
            LEFT JOIN cte2a ON X.Rooster=cte2a.Rooster AND X.TID=cte2a.TafelID GROUP BY X.Rooster,X.Tafelnaam)

    SELECT cte1.Rooster,cte1.TafelNaam,(cte1.Rooster=cte1.standaardRooster) AS isStandaardRooster,cte1.Nummer1,cte2.SpelerHS,cte2.HS FROM cte1 JOIN cte2 ON cte1.Rooster=cte2.Rooster AND cte1.TafelNaam=cte2.TafelNaam
        ORDER BY cte1.Rooster,cte1.TafelNaam
EOT;
$records      = $PDOcon->query($sql)->fetchAll();
$statistieken = $PDOcon->query($sql_statistieken)->fetchAll();
echo json_encode(['records' => $records, 'statistieken' => $statistieken, 'Seizoen' => $seizoen, 'Tafels' => $Tafels]);