# Test Upload Script for Phase-1
# Run: .\test-upload.ps1

$filePath = "test-files\test-metadata.csv"
$url = "http://localhost:3000/upload/ingest"
$apiKey = "test"

Write-Host "🚀 Testing file upload..." -ForegroundColor Cyan
Write-Host "   File: $filePath"
Write-Host "   URL: $url"

# Check if file exists
if (-not (Test-Path $filePath)) {
    Write-Host "❌ File not found: $filePath" -ForegroundColor Red
    exit 1
}

try {
    # Create multipart form data
    $fileBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $filePath))
    $fileName = [System.IO.Path]::GetFileName($filePath)
    
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"",
        "Content-Type: application/octet-stream",
        "",
        [System.Text.Encoding]::UTF8.GetString($fileBytes),
        "--$boundary--"
    )
    $body = $bodyLines -join $LF
    
    $headers = @{
        "x-api-key" = $apiKey
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }
    
    Write-Host "📤 Uploading..." -ForegroundColor Yellow
    
    $response = Invoke-WebRequest -Uri $url -Method Post -Headers $headers -Body $body -UseBasicParsing
    
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
}

