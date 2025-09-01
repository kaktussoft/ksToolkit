<?php
require_once "/var/www/config_waagje.php";
function connectToDatabase()
{
    $dbh = new PDO("mysql:host=localhost;charset=utf8mb4;dbname=" . DBNAME, DBUSER, DBPASSWORD, [PDO::MYSQL_ATTR_MULTI_STATEMENTS => false]);
    $dbh->setAttribute(PDO::ATTR_STRINGIFY_FETCHES, true);
    $dbh->setAttribute(PDO::ATTR_STATEMENT_CLASS, ['MyPDOStatement']);
    $dbh->setAttribute(PDO::ATTR_ORACLE_NULLS, PDO::NULL_TO_STRING);
    $dbh->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    return $dbh;
}
class MyPDOStatement extends PDOStatement
{
    public function custExecute($params = null): PDOStatement | false
    {
        if (! parent::execute($params)) {
            return false;
        }
        return $this;
    }
}
$thisSeizoenSQL = "(SELECT waarde FROM Configuratie WHERE naam='Seizoen')";
function sanitizeListMysql($list, $PDOcon)
{
    $values = explode(',', $list);
    $sanitizedValues = array_map([$PDOcon, 'quote'], $values);
    return implode(',', $sanitizedValues);
}