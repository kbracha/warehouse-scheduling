

<?php

echo "[";

if ($handle = opendir('../data/')) {

    while (false !== ($entry = readdir($handle))) {

        if ($entry != "." && $entry != "..") {

            echo "\"$entry\",";
        }
    }

    echo "\"\"";

    closedir($handle);
}
    
echo "]"
?>