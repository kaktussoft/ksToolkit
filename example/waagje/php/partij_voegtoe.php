<?php
include './functions.php';
header("Content-Type: application/json; charset=UTF-8");
if ($_POST['wachtwoord'] !== MANAGEMENTPWD) {
    die(json_encode(['error' => "Onjuist wachtwoord!"]));
}
// Wachtwoord is juist.
// Check bijna alle doorgegeven gegevens of ze een integer zijn en converteer ze ernaar.
$Car = [];
$HS = [];
$Car[1] = filter_var($_POST["Car1"] ?? "", FILTER_VALIDATE_INT);
$Car[2] = filter_var($_POST["Car2"] ?? "", FILTER_VALIDATE_INT);
$HS[1] = filter_var($_POST["HS1"] ?? "", FILTER_VALIDATE_INT);
$HS[2] = filter_var($_POST["HS2"] ?? "", FILTER_VALIDATE_INT);
$rooster = filter_var($_POST["Rooster"] ?? "", FILTER_VALIDATE_INT);
$Beurten = filter_var($_POST["Beurten"] ?? "", FILTER_VALIDATE_INT);
if ($Car[1] === false || $Car[2] === false || $HS[1] === false || $HS[2] === false || $rooster === false || $Beurten === false) {
    die(json_encode(['error' => "Car1, Car2, HS1, HS2, rooster, of beurten is geen geheel getal!"]));
}
if ($Car[1] < 0 || $Car[2] < 0 || $HS[1] < 0 || $HS[2] < 0) {
    die(json_encode(['error' => "Caramboles en hoogste serie mag niet negatief zijn!"]));
}
if ($Beurten <= 0) {
    die(json_encode(['error' => "Beurten moet groter dan 0 zijn!"]));
}
$datum = DateTime::createFromFormat("d-m-Y", $_POST["datum"] ?? "");
if (!$datum || DateTime::getLastErrors()) {
    die(json_encode(['error' => "Ongeldige datum!"]));
}
$now = new DateTime();
if ($datum > $now) {
    die(json_encode(['error' => "Datum kan niet in de toekomst zijn!"]));
}
$datum = $datum->format("Y/m/d");
// Verbind met database.
$PDOcon = connectToDatabase();
$sql = <<<EOT
    SELECT 1 FROM Spelers S1 JOIN Uitslagen U ON S1.ID=U.SpelerID1 JOIN Spelers S2 ON U.SpelerID2=S2.ID
    JOIN Tafels T ON U.TafelID=T.ID
        WHERE (:spelerN1,:spelerN2) IN ((S1.SpelersNaam,S2.SpelersNaam),(S2.SpelersNaam,S1.SpelersNaam)) AND U.Rooster=:rooster AND T.TafelNaam=:tafel
        AND Seizoen=$thisSeizoenSQL
    LIMIT 1
EOT;
if ($PDOcon->prepare($sql)->custExecute(['spelerN1' => $_POST['spelerN1'], 'spelerN2' => $_POST['spelerN2'], 'tafel' => $_POST['tafel'], 'rooster' => $_POST['Rooster']])->fetch()) {
    die(json_encode(['error' => "Spelers hebben al gespeeld op deze tafel in dit rooster!"]));
}
if (!$PDOcon->prepare("SELECT 1 FROM Spelers WHERE SpelersNaam IN (:spelerN1,:spelerN2) AND Actief HAVING COUNT(*)=2")->custExecute(['spelerN1' => $_POST['spelerN1'], 'spelerN2' => $_POST['spelerN2']])->fetch()) {
    die(json_encode(['error' => "Selecteer 2 verschillende actieve spelers!"]));
}
if ($PDOcon->prepare("SELECT 1 WHERE NOT (:rooster BETWEEN 1 AND (SELECT waarde FROM Configuratie WHERE naam='maxRooster'))")->custExecute(['rooster' => $_POST['Rooster']])->fetch()) {
    die(json_encode(['error' => "Ongeldig rooster!"]));
}
// Check aantal dingen voor thuis- en uitspeler.
for ($key = 1; $key <= 2; $key++) {
    // Heeft de speler een te maken moyenne en te maken caramboles in dit roosterop deze tafel?
    $sql = <<<EOT
        SELECT M.Moyenne,M.Car FROM Moyennes M
        JOIN (SELECT M2.TafelID,M2.SpelerID,MAX(M2.Rooster) AS maxRst FROM Moyennes M2 JOIN Tafels T2 ON M2.TafelID=T2.ID
            WHERE M2.Rooster<=T2.Standaardrooster AND M2.Moyenne IS NOT NULL GROUP BY M2.TafelID,M2.SpelerID) MR
            ON M.TafelID=MR.TafelID AND M.SpelerID=MR.SpelerID AND M.Rooster=MR.maxRst
        JOIN Tafels T ON MR.TafelID=T.ID
        JOIN Spelers S ON M.SpelerID=S.ID WHERE S.SpelersNaam=:spelerN AND T.TafelNaam=:tafel
    EOT;
    if (!($TeMaken[$key] = $PDOcon->prepare($sql)->custExecute(['spelerN' => $_POST["spelerN{$key}"], 'tafel' => $_POST['tafel']])->fetch())) {
        die(json_encode(['error' => "Speler{$key} heeft geen te maken moyenne!"]));
    }
    // Aantal caramboles, hoogste serie, aantal beurten combinatie is mogelijk?
    if ($Car[$key] < $HS[$key] || $Car[$key] > $HS[$key] * $Beurten) {
        die(json_encode(['error' => "Speler{$key} heeft onmogelijk aantal caramboles, hoogste serie, aantal beurten combinatie!"]));
    }
    // Niet te veel caramboles gemaakt?
    if ($Car[$key] > $TeMaken[$key]['Car']) {
        die(json_encode(['error' => "Speler{$key} heeft te veel caramboles gemaakt!"]));
    }
}
if ($Car[1] != $TeMaken[1]['Car'] && $Car[2] != $TeMaken[2]['Car']) {
    die(json_encode(['error' => "Beide spelers zijn niet uit!"]));
}
// Alles is goed. Nu record toevoegen aan tabel Uitslagen.
$sql = <<<EOT
    INSERT INTO Uitslagen(Seizoen,Rooster,TafelID,Datum,Beurten,SpelerID1,Car1,MoyTeMaken1,CarTeMaken1,HS1,PartijP1,SpelerID2,Car2,MoyTeMaken2,CarTeMaken2,HS2,PartijP2)
    SELECT $thisSeizoenSQL,:rooster, (SELECT ID FROM Tafels WHERE TafelNaam=:tafel),'{$datum}', :Beurten,
    (SELECT ID FROM Spelers WHERE SpelersNaam=:spelerN1), :Car1, {$TeMaken[1]['Moyenne']}, {$TeMaken[1]['Car']}, :HS1,
    PartijPunten(:Car1,{$TeMaken[1]['Car']},:Car2,{$TeMaken[2]['Car']},:Beurten,{$TeMaken[1]['Moyenne']}),
    (SELECT ID FROM Spelers WHERE SpelersNaam=:spelerN2), :Car2, {$TeMaken[2]['Moyenne']}, {$TeMaken[2]['Car']}, :HS2,
    PartijPunten(:Car2,{$TeMaken[2]['Car']},:Car1,{$TeMaken[1]['Car']},:Beurten,{$TeMaken[2]['Moyenne']})
EOT;
$PDOcon->prepare($sql)->custExecute([
    'rooster' => $_POST['Rooster'],
    'tafel' => $_POST['tafel'],
    'spelerN1' => $_POST['spelerN1'],
    'Car1' => $_POST['Car1'],
    'HS1' => $_POST['HS1'],
    'spelerN2' => $_POST['spelerN2'],
    'Car2' => $_POST['Car2'],
    'HS2' => $_POST['HS2'],
    'Beurten' => $_POST['Beurten']
]);
echo json_encode(['message' => "Partij succesvol ingevoerd."]);
