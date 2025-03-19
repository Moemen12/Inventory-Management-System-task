<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductType extends Model
{
    use  HasUuids;

    protected $fillable = [
        'name',
        'description',
        'image',
        'user_id'
    ];


    public function products()
    {
        return $this->hasMany(Product::class, 'product_type_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
