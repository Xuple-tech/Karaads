# Reco ML Pipeline

This pipeline trains lightweight recommendation weights with Python and deploys them to Laravel runtime configs.

## Train and apply

```bash
php artisan reco:ml:train --apply
```

## Roll back to pre-ML weights

```bash
php artisan reco:ml:rollback
```

## Train specific scope

```bash
php artisan reco:ml:train --entity=ad --surface=feed --days=30 --apply
```

## Custom Python binary

```bash
php artisan reco:ml:train --python=python3 --apply
```

Artifacts are written to:

- `storage/app/reco/datasets/*.csv`
- `storage/app/reco/models/*.json`
