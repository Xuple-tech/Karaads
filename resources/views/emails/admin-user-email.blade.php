@component('mail::message')
# Hi {{ $user->name ?: 'there' }},

{!! nl2br(e($body)) !!}

Thanks,<br>
**Karaads Team**
@endcomponent
