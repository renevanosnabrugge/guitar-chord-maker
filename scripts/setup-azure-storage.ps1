# Azure Storage Setup Script for ChordMaker
# This script helps set up Azure Storage for the ChordMaker application

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$StorageAccountName,
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "East US",
    
    [Parameter(Mandatory=$false)]
    [string]$ContainerName = "chordmaker"
)

# Function to check if Azure CLI is installed
function Test-AzureCLI {
    try {
        $result = az --version 2>$null
        return $true
    }
    catch {
        return $false
    }
}

# Function to check if user is logged in to Azure
function Test-AzureLogin {
    try {
        $result = az account show 2>$null
        return $true
    }
    catch {
        return $false
    }
}

Write-Host "🎸 ChordMaker - Azure Storage Setup Script" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

if (-not (Test-AzureCLI)) {
    Write-Host "❌ Azure CLI is not installed." -ForegroundColor Red
    Write-Host "Please install Azure CLI from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Azure CLI is installed" -ForegroundColor Green

if (-not (Test-AzureLogin)) {
    Write-Host "❌ Not logged in to Azure." -ForegroundColor Red
    Write-Host "Please run: az login" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Logged in to Azure" -ForegroundColor Green

# Validate storage account name
if ($StorageAccountName.Length -lt 3 -or $StorageAccountName.Length -gt 24) {
    Write-Host "❌ Storage account name must be between 3 and 24 characters." -ForegroundColor Red
    exit 1
}

if ($StorageAccountName -cnotmatch '^[a-z0-9]+$') {
    Write-Host "❌ Storage account name can only contain lowercase letters and numbers." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Storage account name is valid" -ForegroundColor Green

# Start setup process
Write-Host "`nStarting Azure Storage setup..." -ForegroundColor Yellow
Write-Host "Resource Group: $ResourceGroupName" -ForegroundColor Cyan
Write-Host "Storage Account: $StorageAccountName" -ForegroundColor Cyan
Write-Host "Location: $Location" -ForegroundColor Cyan
Write-Host "Container: $ContainerName" -ForegroundColor Cyan

# Create resource group if it doesn't exist
Write-Host "`n📦 Creating resource group..." -ForegroundColor Yellow
$rgExists = az group exists --name $ResourceGroupName --output tsv
if ($rgExists -eq "false") {
    az group create --name $ResourceGroupName --location $Location --output table
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create resource group" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Resource group created successfully" -ForegroundColor Green
} else {
    Write-Host "✅ Resource group already exists" -ForegroundColor Green
}

# Create storage account
Write-Host "`n💾 Creating storage account..." -ForegroundColor Yellow
az storage account create `
    --name $StorageAccountName `
    --resource-group $ResourceGroupName `
    --location $Location `
    --sku Standard_LRS `
    --kind StorageV2 `
    --access-tier Hot `
    --output table

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create storage account" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Storage account created successfully" -ForegroundColor Green

# Create container
Write-Host "`n📁 Creating container..." -ForegroundColor Yellow
az storage container create `
    --name $ContainerName `
    --account-name $StorageAccountName `
    --auth-mode login `
    --output table

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create container" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Container created successfully" -ForegroundColor Green

# Configure CORS
Write-Host "`n🌐 Configuring CORS..." -ForegroundColor Yellow
$corsRules = @'
[
  {
    "allowedOrigins": ["*"],
    "allowedMethods": ["GET", "PUT", "DELETE", "HEAD", "POST"],
    "allowedHeaders": ["*"],
    "exposedHeaders": ["*"],
    "maxAgeInSeconds": 3600
  }
]
'@

$corsRules | az storage cors add `
    --services b `
    --account-name $StorageAccountName `
    --auth-mode login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to configure CORS" -ForegroundColor Red
    exit 1
}

Write-Host "✅ CORS configured successfully" -ForegroundColor Green

# Generate SAS token
Write-Host "`n🔑 Generating SAS token..." -ForegroundColor Yellow
$tomorrow = (Get-Date).AddDays(365).ToString("yyyy-MM-ddTHH:mm:ssZ")

$sasToken = az storage container generate-sas `
    --name $ContainerName `
    --account-name $StorageAccountName `
    --permissions rwdlac `
    --expiry $tomorrow `
    --auth-mode login `
    --output tsv

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate SAS token" -ForegroundColor Red
    exit 1
}

# Get storage account endpoint
$endpoint = az storage account show `
    --name $StorageAccountName `
    --resource-group $ResourceGroupName `
    --query "primaryEndpoints.blob" `
    --output tsv

$sasUrl = "${endpoint}${ContainerName}?${sasToken}"

Write-Host "✅ SAS token generated successfully" -ForegroundColor Green

# Display results
Write-Host "`n🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "`nYour Azure Storage is ready for ChordMaker!" -ForegroundColor Yellow
Write-Host "`n📋 Configuration Details:" -ForegroundColor Cyan
Write-Host "Resource Group: $ResourceGroupName" -ForegroundColor White
Write-Host "Storage Account: $StorageAccountName" -ForegroundColor White
Write-Host "Container: $ContainerName" -ForegroundColor White
Write-Host "Location: $Location" -ForegroundColor White

Write-Host "`n🔗 SAS URL for your .env file:" -ForegroundColor Cyan
Write-Host $sasUrl -ForegroundColor Yellow

Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Copy the SAS URL above" -ForegroundColor White
Write-Host "2. Create a .env file in your ChordMaker project root" -ForegroundColor White
Write-Host "3. Add this line to your .env file:" -ForegroundColor White
Write-Host "   VITE_AZURE_SAS_URL=$sasUrl" -ForegroundColor Green
Write-Host "4. Start your ChordMaker application" -ForegroundColor White

Write-Host "`n⚠️  Important Security Notes:" -ForegroundColor Red
Write-Host "- This SAS token is valid for 1 year" -ForegroundColor Yellow
Write-Host "- Never commit the .env file to version control" -ForegroundColor Yellow
Write-Host "- Regenerate the token before it expires" -ForegroundColor Yellow
Write-Host "- Consider using shorter expiry dates for production" -ForegroundColor Yellow

Write-Host "`n📚 For more information, see:" -ForegroundColor Cyan
Write-Host "- ChordMaker Azure Integration Guide: ./AZURE_STORAGE_INTEGRATION.md" -ForegroundColor White
Write-Host "- Azure Storage Documentation: https://docs.microsoft.com/en-us/azure/storage/" -ForegroundColor White
