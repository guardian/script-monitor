## Script monitor

This is used to monitor the changing of third party scripts on theguardian.com

This runs on an hourly cron in a lambda. It current just uses an artifact bucket in S3 to store the current state of the scripts and uploads a the new script if it has changed.

Some scripts can only be byte compared because of unique request properties in the file.

## Usage

`make run` - Run the script with the `frontend` profile

`make bundle` - Build a zip to upload to the `scripts-monitor` lambda.


