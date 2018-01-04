import sys

sys.path.insert(0,'/var/www/live_game')

from live import app as application
application.run(host='0.0.0.0')