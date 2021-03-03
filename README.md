# @dictadata/storage-etl 1.5.0

Command line ETL utilitiy to transfer, transform and codify data between local and distributed storage sources.

## Prerequisites

Node.js version 15.0 or higher.  Download the installer from https://nodejs.org/en/download/.

## Installation

    npm install -g @dictadata/storage-etl

## Command Line Usage

```bash
  storage-etl command [-c tractsFile] [tractName]

  Commands:
    config - create example etl_tracts.json file in the current directory.
    codify - determine storage encoding by codifying a single data source schema.
    list - listing of schema names in a data source.
    scan - list data source and determine storage encoding by codifying multiple schemas.
    transfer - transfer data between data sources with optional transforms.
    download - download schemas from remote files system to the local file system.
    upload - upload schemas from local file system to remote file system.
  
  tractsFile
    Configuration file that defines tracts, plug-ins and logging.
    Default configuration file is ./etl_tracts.json
  
  tractName
    The tract to follow in the configuration file.
    Default tractName is the command name.
```

## Tracts Configuration File

- A tracts configuration specifies the source and destination SMT addresses along with options, encoding, transform and output information.
- Source and destination MUST be supported and compatible storage sources.
- Scan functionality supports file storage such as local folders, FTP and AWS S3 buckets.
- Transforms are optional. If specified then fields will be transformed between source and destination.

## Examples

### Transfer and transform a .json file to "flat" .csv file

    storage-etl transfer -c etl_flatten.json

etl_flatten.json:
```json
{
  "transfer": {
    "origin": {
      "smt": "json|./test/data/|foofile.json|*"
    },
    "transforms": {
      "select": {
        "fields": {
          "Foo": "foo",
          "Bar": "bar",
          "Baz": "baz",
          "State.Enabled": "enabled"
        }
      }
    },
    "terminal": {
      "smt": "csv|./output/|fooflat.csv|*",
      "options": {
        "header": true
      }
    }
  }
}
```

foofile.json:
```json
[
  {
    "Foo": "first",
    "Bar": 123,
    "Baz": "2018-10-07",
    "State": {
      "Enabled": true
    }
  },
  {
    "Foo": "second",
    "Bar": 456,
    "Baz": "2018-10-07",
    "State": {
      "Enabled": false
    }
  },
  {
    "Foo": "third",
    "Bar": 789,
    "Baz": "2018-10-18",
    "State": {
      "Enabled": true
    }
  }
]
```

fooflat.csv
```json
  "foo","bar","baz","enabled"
  "first",123,"2018-10-07",true
  "second",456,"2018-10-07",false
  "third",789,"2018-10-18",true
```

### NOSA Weather Service transfer

```
storage-etl transfer -c etl_weather.json forecast
```

etl_weather.json:
```json
{
  "forecast": {
    "origin": {
      "smt": "rest|https://api.weather.gov/gridpoints/DVN/34,71/|forecast|=*",
      "options": {
        "headers": {
          "Accept": "application/ld+json",
          "User-Agent": "@dictadata.org/storage-node contact:info@dictadata.org"
        },
        "extract": {
          "names": "",
          "data": "periods"
        }
      }
    },
    "terminal": {
      "smt": "csv|./output/|etl-3-weather.csv|*",
      "options": {
        "header": true
      }
    }
  }
}
```
