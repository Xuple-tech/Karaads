<?php

use App\Models\User;

test('guests can load the dashboard spa shell', function () {
    $this->get('/dashboard')->assertOk();
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/dashboard')->assertOk();
});
