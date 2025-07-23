<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Get all files in the folder except this script
$files = array_diff(scandir(__DIR__), ['.', '..', 'index.php']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Songs</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f9f9f9; padding: 2rem; }
    h1 { color: #333; }
    ul { list-style: none; padding: 0; }
    li { margin: 8px 0; }
    a { color: #007BFF; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Available Songs</h1>
  <ul>
    <?php foreach ($files as $file): ?>
      <li><a href="<?= htmlspecialchars($file) ?>" download><?= htmlspecialchars($file) ?></a></li>
    <?php endforeach; ?>
  </ul>
</body>
</html>
