<?php
require_once "/var/www/config/kaktussoft.nl/config_waagje.php";
class Database extends Pdo\Mysql
{
    private static ?Database $instance = null;
    private function __construct(string $dsn, string $username, string $password, ?array $options = null)
    {
        $defaultOptions = [
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_STRINGIFY_FETCHES => true,
            PDO::ATTR_STATEMENT_CLASS => [MyPDOStatement::class],
            Pdo\Mysql::ATTR_MULTI_STATEMENTS => false,
        ];
        $options = $options ? $options + $defaultOptions : $defaultOptions;
        parent::__construct($dsn, $username, $password, $options);
    }
    public static function getInstance(?string $dsn = null, ?string $username = null, ?string $password = null, ?array $options = null): self
    {
        if (self::$instance === null) {
            if ($dsn === null || $username === null) {
                throw new InvalidArgumentException("Database connection parameters required for initialization.");
            }
            self::$instance = new self($dsn, $username, $password, $options);
        }
        return self::$instance;
    }
}
class MyPDOStatement extends PDOStatement
{
    public function custExecute(?array $params = null): self|false
    {
        if (!parent::execute($params)) return false;
        return $this;
    }
}
function connectToDatabase() {
    //connect to mysql database
    $PDOcon = Database::getInstance("mysql:host=localhost;charset=utf8mb4;dbname=" . DBNAME, DBUSER, DBPASSWORD);
    return $PDOcon;
}
$thisSeizoenSQL = "(SELECT waarde FROM Configuratie WHERE naam='Seizoen')";
function sanitizeListMysql($list)
{
    $PDOcon = Database::getInstance();
    $values = explode(',', $list);
    $sanitizedValues = array_map(fn($str) => $PDOcon->quote($str), $values);
    return implode(',', $sanitizedValues);
}