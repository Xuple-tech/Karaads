<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            font-size: 12pt; 
            line-height: 1.5; 
            color: #000;
            margin: 0;
            padding: 0;
        }
        .document-container { 
            padding: 20px;
        }
        .document-header {
            margin-bottom: 20px;
        }
        .document-title {
            font-size: 18pt;
            margin: 0 0 10px 0;
            font-weight: bold;
        }
        .document-meta {
            font-size: 10pt;
            color: #666;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 15px;
            margin-bottom: 10px;
        }
        p {
            margin-bottom: 10px;
        }
        ul, ol {
            margin-left: 20px;
            margin-bottom: 10px;
        }
        li {
            margin-bottom: 3px;
        }
        .document-footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #999;
            font-size: 10pt;
            color: #666;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 10px 0;
        }
        th, td {
            border: 1px solid #999;
            padding: 5px;
            text-align: left;
        }
        th {
            background-color: #eee;
        }
    </style>
</head>
<body>
    <div class="document-container">
        <header class="document-header">
            <h1 class="document-title">{{ $title }}</h1>
            <div class="document-meta">
                <span class="generated-date">{{ $generatedAt ?? now()->format('F j, Y H:i:s') }}</span>
                <span class="document-type">{{ ucfirst($documentType ?? 'general') }} Document</span>
            </div>
        </header>
        
        <main class="document-content">
            {!! $content !!}
        </main>
        
        @if($includePageNumbers ?? true)
        <footer class="document-footer">
            <div class="footer-content">
                <div class="page-number">Page <span class="page"></span></div>
            </div>
        </footer>
        @endif
    </div>
    
    @if($includePageNumbers ?? true)
    <script>
        // Add page numbers dynamically
        document.addEventListener('DOMContentLoaded', function() {
            var pages = document.querySelectorAll('.page');
            for (var i = 0; i < pages.length; i++) {
                pages[i].textContent = (i + 1);
            }
        });
    </script>
    @endif
</body>
</html>