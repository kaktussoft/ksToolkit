<?php
include './functions.php';
$PDOcon = connectToDatabase();
if ($_POST['wachtwoord'] !== MANAGEMENTPWD) {
    die(json_encode(['error' => "Onjuist wachtwoord!"]));
}
$spelersList = implode(',', array_map([$PDOcon, 'quote'], $_POST['spelers'] ??= ['']));
$sql = <<<EOT
    UPDATE Moyennes M JOIN (SELECT TafelID,SpelerID,GREATEST(1,ROUND(SUM(Car)/SUM(Beurten)/0.05)*0.05) AS GMoy
        FROM (SELECT SO.* FROM SpelersOverzicht SO
    JOIN (SELECT *,ROW_NUMBER() OVER(PARTITION BY TafelID ORDER BY Seizoen DESC,Rooster DESC) AS rownum FROM
        (SELECT DISTINCT U.TafelID,U.Seizoen,U.Rooster FROM Uitslagen U
    JOIN Tafels T ON U.TafelID=T.ID AND T.TafelNaam=:tafel WHERE U.Seizoen!=$thisSeizoenSQL OR U.Rooster<=T.Standaardrooster) X) Y
            ON SO.Seizoen=Y.Seizoen AND SO.TafelID=Y.TafelID AND SO.Rooster=Y.Rooster WHERE Y.rownum<=2) Z GROUP BY TafelID,SpelerID) Nieuw
    ON M.TafelID=Nieuw.TafelID AND M.SpelerID=Nieuw.SpelerID AND M.SpelerID IN (SELECT ID FROM Spelers WHERE Actief AND SpelersNaam IN ($spelersList))
    SET M.Moyenne=Nieuw.Gmoy,M.Car=Caramboles(Nieuw.GMoy) WHERE M.Rooster=(SELECT Standaardrooster+1 FROM Tafels WHERE TafelNaam=:tafel) AND M.Moyenne IS NULL;
EOT;
echo json_encode(['message' => "{$PDOcon->prepare($sql)->custExecute(['tafel' =>$_POST['tafel']])->rowCount()} moyennes bijgewerkt"]);