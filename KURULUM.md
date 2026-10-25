# DSATalks – Windows Server Kurulum Rehberi

Proje klasörü `C:\dsa-talks`, alan adı `dsatalks.atu.edu.tr` örnek olarak yazıldı; farklıysa her yerde değiştir.
Bütün PowerShell komutları **yönetici olarak açılmış PowerShell**'de çalıştırılır.

## 0. Hazırlık

- **Node.js** kurulu olmalı. Kontrol için:
  ```powershell
  node -v
  ```
  v20.9 veya üstü olmalı.
- Gerekenleri kendi bilgisayarına indir, sonra Uzak Masaüstü ile sunucuya kopyala:
  - **MongoDB Community Server 8.0** – Windows x64 MSI (mongodb.com/try/download/community)
  - **MongoDB Shell (mongosh)** – MSI (mongodb.com/try/download/shell)
  - **NSSM 2.24** – zip (nssm.cc/download)

## 1. Kodu sunucuya al

- GitHub'dan `git clone` ile `C:\dsa-talks` klasörüne al. Klasör zaten varsa içinde `git pull` çalıştır.
- Kopyalayarak taşıyacaksan `node_modules` ve `.next` klasörlerini kopyalama.

## 2. `.env` dosyası

`C:\dsa-talks\.env` dosyasında şunlar dolu olsun:

```
DATABASE_URL="mongodb://127.0.0.1:27017/dsatalks?replicaSet=rs0"
AUTH_SECRET="..."
AUTH_TRUST_HOST=true
NEXT_PUBLIC_SITE_URL="https://dsatalks.atu.edu.tr"
SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM
```

`DATABASE_URL`'de `mongo:27017` değil **`127.0.0.1:27017`** yazmalı. `AUTH_URL`'yi şimdilik **ekleme**; 7. adımda eklenecek.

## 3. MongoDB kurulumu

1. **MongoDB Server MSI**'ını çalıştır: Complete seç, "Install MongoD as a Service" ✓ kalsın. Compass'ı kurmana gerek yok.
2. **mongosh MSI**'ını kur.
3. Not Defteri'ni **yönetici olarak** aç ve şu dosyayı aç:
   `C:\Program Files\MongoDB\Server\8.0\bin\mongod.cfg`

   `#replication:` satırını şöyle değiştir (alt satır **2 boşlukla** başlar, sekme değil):
   ```yaml
   replication:
     replSetName: rs0
   ```
   `bindIp: 127.0.0.1` satırına dokunma. Kaydet.
4. MongoDB'yi yeniden başlat:
   ```powershell
   Restart-Service MongoDB
   ```
5. PowerShell'i kapatıp **yeniden aç**, sonra replica set'i başlat:
   ```powershell
   mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'127.0.0.1:27017'}]})"
   ```
6. Kontrol et; çıktı `1` olmalı:
   ```powershell
   mongosh --eval "rs.status().ok"
   ```

## 4. Siteyi kur ve derle

```powershell
cd C:\dsa-talks
```

```powershell
npm ci
```

```powershell
npx prisma db push
```

```powershell
npm run build
```

## 5. Elle test

```powershell
npm start
```

Sunucunun tarayıcısında `http://localhost:8080` adresini aç ve kontrol et:

- [ ] Ana sayfa açılıyor
- [ ] `/kurullar` açılıyor
- [ ] `/admin` girişi oluyor. İlk admin kendiliğinden oluşur: `.env`'deki `ADMIN_EMAIL`/`ADMIN_PASSWORD` ile, bunlar boşsa
  `admin@admin.com` / `admin123` ile. **Girdikten sonra Yöneticiler sayfasından şifreyi hemen değiştir.**
- [ ] Anket Ayarları'ndan anketi açıp `/anket`'i deneme verisiyle doldur. Sertifika iniyor ve e-posta geliyor mu?
  Sonra deneme yanıtını admin panelinden sil.

Bitince terminalde **Ctrl + C** ile durdur.

Sunucuda hero animasyonunun durması normal: sunucunun Windows ayarından kaynaklanıyor, ziyaretçiler animasyonu görecek.

## 6. NSSM ile Windows hizmeti

1. NSSM zip'ini aç, `win64\nssm.exe` dosyasını `C:\nssm\nssm.exe` olarak koy.
2. `C:\dsa-talks-logs` klasörünü oluştur.
3. Ayar penceresini aç:
   ```powershell
   C:\nssm\nssm.exe install DSATalks
   ```
4. Pencereyi doldur:
   - **Application**
     - Path: `C:\Program Files\nodejs\node.exe`
     - Startup directory: `C:\dsa-talks`
     - Arguments: `node_modules\next\dist\bin\next start -p 8080`
   - **Details** → Startup type: **Automatic**
   - **Dependencies** → `MongoDB`
   - **Exit actions** → Restart application, delay `5000` ms
   - **I/O**
     - Output: `C:\dsa-talks-logs\site.log`
     - Error: `C:\dsa-talks-logs\error.log`
   - **File rotation** → Rotate files ✓, boyut `10485760`
5. **Install service**'e bas.
6. `services.msc` → **DSATalks** → sağ tık → **Başlat**.
7. `http://localhost:8080` açılıyor mu kontrol et. Açılmıyorsa `C:\dsa-talks-logs\error.log` dosyasına bak.
8. **Sunucuyu yeniden başlat** ve DSATalks'un kendiliğinden açıldığını kontrol et.

Ayar değiştirmek için:

```powershell
C:\nssm\nssm.exe edit DSATalks
```

## 7. IIS reverse proxy

### 7.1 Bilgi işlemden iste

- `dsatalks.atu.edu.tr` için bu sunucuya bir DNS kaydı
- Üniversite güvenlik duvarında bu sunucuya **80 ve 443**'ün açılması
- SSL sertifikası (`*.atu.edu.tr` ya da Let's Encrypt)

### 7.2 Eklentiler

iis.net'ten **URL Rewrite 2.1** ve **Application Request Routing 3.0**'ı kur, sonra IIS Yöneticisi'ni yeniden aç.
Bilgi işlem kurmuşsa bu adımı atla.

### 7.3 Proxy'yi aç

1. Solda **sunucu adı** → **Application Request Routing Cache** → **Server Proxy Settings**.
2. **Enable proxy** ✓.
3. **Reverse rewrite host in response headers** ✗ (işareti kaldır).
4. **Apply**.

### 7.4 Gerçek adresi siteye ilet (atlama!)

1. **Sunucu adı** → **Configuration Editor** → Section: `system.webServer/proxy`.
2. **preserveHostHeader** → **True** → **Apply**.

### 7.5 IIS sitesi

1. `C:\inetpub\dsatalks` adında boş bir klasör aç.
2. **Sites** → **Add Website**:
   - Name: `DSATalks`
   - Path: `C:\inetpub\dsatalks`
   - Binding: **https**, 443, host `dsatalks.atu.edu.tr`, sertifikayı seç
3. **Bindings** → **Add**: **http**, 80, aynı host.

### 7.6 Yönlendirme kuralı

1. DSATalks sitesi → **URL Rewrite** → **Add Rule(s)** → **Reverse Proxy**.
2. Adres: `localhost:8080`, **Enable SSL Offloading** ✓ → **OK**.

### 7.7 https bilgisini ilet (atlama!)

1. URL Rewrite → **View Server Variables** → **Add** → `HTTP_X_FORWARDED_PROTO`.
2. 7.6'da oluşan kurala çift tıkla → **Server Variables** → **Add**:
   - Name: `HTTP_X_FORWARDED_PROTO`
   - Value: `https`
3. **Apply**.

### 7.8 http'yi https'e yönlendir

1. URL Rewrite → **Add Rule(s)** → **Blank rule**:
   - Name: `HTTPS`
   - Pattern: `(.*)`
   - Conditions → Add: `{HTTPS}` = `^OFF$`
   - Action: **Redirect** → `https://{HTTP_HOST}/{R:1}` → **Permanent (301)**
2. **Apply**.
3. Bu kuralı **Move Up** ile reverse proxy kuralının **üstüne** taşı.

### 7.9 `.env`'ye ekle ve yeniden derle

`.env`'ye şu satırı ekle:

```
AUTH_URL="https://dsatalks.atu.edu.tr"
```

Sonra 9. adımdaki güncelleme adımlarını uygula: hizmeti durdur → `npm run build` → hizmeti başlat.

## 8. Son test

Telefondan **mobil veriyle** (okul ağına bağlı değilken):

- [ ] `https://dsatalks.atu.edu.tr` açılıyor
- [ ] `http://...` yazınca https'e geçiyor
- [ ] `/anket` gönderiliyor, sertifika iniyor
- [ ] `/admin` girişi oluyor, panel açılıyor
- [ ] Sertifikadaki QR kod `/dogrula` sayfasını açıyor
- [ ] Şifremi unuttum e-postasındaki link doğru adrese gidiyor

## 9. Her güncellemede

1. `services.msc` → DSATalks → **Durdur**
2. Komutlar:
   ```powershell
   cd C:\dsa-talks
   ```
   ```powershell
   git pull
   ```
   ```powershell
   npm ci
   ```
   ```powershell
   npm run build
   ```
3. `services.msc` → DSATalks → **Başlat**

## Sorun çıkarsa

| Belirti | Bak |
|---|---|
| `mongosh` tanınmıyor | PowerShell'i kapatıp yeniden aç |
| MongoDB başlamıyor | `mongod.cfg`'deki girinti (2 boşluk, sekme değil) |
| `prisma db push` "replica set" hatası veriyor | 3.5 ve 3.6. adımlar |
| Site açılmıyor (502) | `services.msc` → DSATalks çalışıyor mu? `error.log` |
| Girişten sonra `localhost:8080`'e atıyor | 7.4 |
| Anket veya giriş "Invalid request" hatası veriyor | 7.4 ve 7.7 |
| `npm ci` "dosya kullanımda" hatası veriyor | Önce DSATalks hizmetini durdur |

## Güvenlik

- Windows güvenlik duvarında **27017** (MongoDB) ve **8080** (site) dışarıya **açılmaz**. Dışarıya sadece IIS'in 80/443 portları açık olur.
- `.env` dosyasını kimseyle paylaşma; içinde e-posta şifresi ve gizli anahtar var.
- Varsayılan admin şifresini ilk girişte değiştir.
