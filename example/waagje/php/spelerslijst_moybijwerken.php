<?php
include './functions.php';
$PDOcon = connectToDatabase();
$sql = <<<EOT
    SELECT S.SpelersNaam,COUNT(*) AS AantalPartijen FROM Spelers S JOIN SpelersOverzicht SO ON S.ID=SO.SpelerID JOIN Tafels T
        ON T.ID=SO.TafelID AND T.StandaardRooster=SO.Rooster JOIN Moyennes M ON S.ID=M.SpelerID AND T.ID=M.TafelID AND T.StandaardRooster+1=M.Rooster
            WHERE S.Actief AND SO.Seizoen=$thisSeizoenSQL AND T.TafelNaam=:tafel
                AND T.StandaardRooster<(SELECT waarde FROM Configuratie WHERE naam='maxRooster') AND M.Moyenne IS NULL
            GROUP BY S.SpelersNaam
            ORDER BY S.SpelersNaam
EOT;
$records = $PDOcon->prepare($sql)->custExecute(['tafel' => $_GET['tafel']])->fetchAll();
echo json_encode($records);