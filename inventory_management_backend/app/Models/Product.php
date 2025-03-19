<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use  HasUuids;

    protected $fillable = [
        'name',
        'quantity',
        'description',
        'image',
        'serial_number',
        'user_id',
        'product_type_id',
        'has_sold'
    ];


    public function setHasSoldAttribute($value)
    {
        if (is_string($value)) {
            $this->attributes['has_sold'] = $value === 'true' ? 1 : 0;
        } else {
            $this->attributes['has_sold'] = $value ? 1 : 0;
        }
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
