<?php
$config = require 'config.php';

$host = $config['database']['host'];
$dbname = $config['database']['dbname'];
$username = $config['database']['username'];
$password = $config['database']['password'];

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = '
    DROP TABLE IF EXISTS answers;
    DROP TABLE IF EXISTS questions;
    DROP TABLE IF EXISTS users;


    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        phone VARCHAR(15) UNIQUE NOT NULL,
        email VARCHAR(100),
        verification_code VARCHAR(8),
        competition_started BOOLEAN DEFAULT FALSE,
        score INT DEFAULT 0,
        avatar VARCHAR(255) DEFAULT "/noghte/user/resource/avatar_0.png",
        uuid CHAR(36) UNIQUE NOT NULL DEFAULT (UUID())
    );

    CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_text TEXT NOT NULL,
        explanation TEXT NOT NULL,
        a1 TEXT NOT NULL,
        a2 TEXT NOT NULL,
        a3 TEXT NOT NULL,
        a4 TEXT NOT NULL,
        correctanswer TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        correct BOOLEAN NOT NULL,
        question_id INT NOT NULL,
        answer TEXT NOT NULL,
        time_submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (question_id) REFERENCES questions(id)
    );
    
    -- Insert questions into the table with explanations
    INSERT INTO questions (question_text, explanation, a1, a2, a3, a4, correctanswer) VALUES
    ("کدام کشور تنها کشوری است که پرچمش به شکل مربع است؟", "واتیکان پرچم رسمی مربع دارد.", "واتیکان", "نپال", "سوئیس", "سنگاپور", "a1"),
    ("اگر روی سطح ماه بپرید، نیروی جاذبه چند برابر کمتر از زمین خواهد بود؟", "جاذبه ماه یک‌ششم زمین است.", "۲ برابر", "۴ برابر", "۶ برابر", "۸ برابر", "a3"),
    ("اولین المپیک مدرن در کدام سال برگزار شد؟", "در سال ۱۸۹۶ در آتن برگزار شد.", "۱۸۹۲", "۱۸۹۶", "۱۹۰۰", "۱۹۰۴", "a2"),
    ("قدیمی‌ترین ساز شناخته‌شده توسط بشر چیست؟", "فلوت قدیمی‌ترین ساز است.", "طبل", "فلوت", "چنگ", "گیتار", "a2"),
    ("کدام سیاره کوتاه‌ترین روزها را دارد؟", "مشتری روزهایی ۱۰ ساعته دارد.", "زحل", "مشتری", "مریخ", "زمین", "a2"),
    ("اولین زبان برنامه‌نویسی دنیا چه نام داشت؟", "زبان ماشین اولین بود.", "پایتون", "فورترن", "کوبول", "ماشینی", "a4"),
    ("کدام حیوان قادر است تا ۸ سال بدون غذا زنده بماند؟", "خرس آبی سال‌ها بدون غذا زنده می‌ماند.", "شتر", "لاک‌پشت", "خرچنگ نعل‌اسبی", "خرس آبی", "a4"),
    ("اولین انسانی که قله اورست را فتح کرد چه کسی بود؟", "ادموند هیلاری اولین بود.", "ادموند هیلاری", "تنزینگ نورگی", "راینولد مسنر", "جورج مالوری", "a1"),
    ("پرسرعت‌ترین پرنده در هنگام شکار کدام است؟", "شاهین سریع‌ترین است.", "شاهین", "عقاب طلایی", "جغد برفی", "کرکس", "a1"),
    ("کدام عنصر شیمیایی سبک‌ترین عنصر جدول تناوبی است؟", "هیدروژن سبک‌ترین عنصر است.", "اکسیژن", "هیدروژن", "هلیم", "لیتیم", "a2");

'."
    INSERT INTO users (first_name, last_name, phone) VALUES
    ('مهدی', 'لطیفی', 'ASDQWE!@#'),
    ('محمد مهدی', 'لطیفی', '09902942523'),
    ('امیرحسین', 'مهروانی', '09124680417'),
    ('سروش', 'خزایی', '09206768868'),
    ('آراد', 'حسینی', '09121234567'),
    ('لیلا', 'شریفی', '09331234567'),
    ('کامران', 'دشتی', '09171234567'),
    ('مریم', 'سلیمی', '09213456789'),
    ('احمد', 'محمودی', '09381234567'),
    ('رینا', 'عبداللهی', '09173456789'),
    ('مهران', 'بابایی', '09237654321'),
    ('سیما', 'تاجیک', '09117654321'),
    ('ساسان', 'بهرامی', '09345678901');
    ";

    $pdo->exec($sql);
    echo "Tables created and data inserted successfully.";


    // Read SQL file containing user data
    $user_sql_file = 'users_insert.sql';
    if (file_exists($user_sql_file)) {
        $user_sql = file_get_contents($user_sql_file);
        $pdo->exec($user_sql);
        echo "User data inserted successfully.\n";
    } else {
        echo "User SQL file not found: $user_sql_file\n";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
