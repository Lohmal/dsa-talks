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
ADMIN_EMAIL, ADMIN_PASSWORD
SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM
```

Admin girişi şifreden sonra e-postayla gelen 6 haneli kodu ister, bu yüzden SMTP ayarları çalışmalı.
`admin@admin.com` hesabının kodu o adrese değil `ADMIN_EMAIL`'e (o boşsa ya da o da `admin@admin.com` ise `SMTP_USER` kutusuna) gider; bu hesapla
girdikten sonra Yöneticiler sayfasından e-postasını gerçek bir adresle değiştir.

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
  `admin@admin.com` / `admin123` ile. Şifreden sonra e-postayla gelen 6 haneli kodu gir (`admin@admin.com` için kod
  `ADMIN_EMAIL`'e, o boşsa ya da `admin@admin.com` ise `SMTP_USER` kutusuna gelir). **Girdikten sonra Yöneticiler sayfasından şifreyi hemen değiştir.**
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

### 7.0 Hangi yol? Önce durumu kontrol et

1. **Gizli pencerede** (ya da telefondan) `https://confdsa.atu.edu.tr` adresini aç. Normal pencerede eski bir sitenin
   yönlendirmesi (örneğin `/#!/`) tarayıcı önbelleğinden gelebilir.
2. IIS Yöneticisi'nde solda **Sites** listesine bak: `confdsa.atu.edu.tr` bağlantısı (Bindings) olan ya da 443 portunu
   kullanan bir site var mı?
3. Solda **sunucu adı** → **Server Certificates**: `confdsa.atu.edu.tr` ya da `*.atu.edu.tr` için sertifika var mı?

| Durum | Ne yapılır |
|---|---|
| **A)** Listede o adrese bağlı bir site var (dosyaları silinmiş olsa bile) | **7B**'yi uygula. 7B.3'te Physical path'i boş `C:\inetpub\dsatalks` klasörüne çevir; silinmiş bir klasörü göstermesin |
| **B)** Site IIS'ten tamamen silinmiş, ama Server Certificates'ta sertifika var | Bu bölümü (**7**) uygula: yeni site açılır, 7.5'te binding'e https, 443, host `confdsa.atu.edu.tr` yazıp o sertifikayı seç. Bilgi işlemden DNS ve port istemeye gerek yok (7.1'i atla), adres zaten bu sunucuya geliyor |
| **C)** Site de sertifika da yok | Sertifikayı bilgi işlemden iste, sonra **B** gibi devam et |
| Gizli pencerede hâlâ eski site açılıyor | IIS'te o adrese bağlı bir site hâlâ var → **A** |
| Gizli pencerede hiçbir şey ya da IIS hata sayfası açılıyor | Site silinmiş → **B** veya **C** |

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

## 7B. IIS'te mevcut siteyi kullanma (confdsa.atu.edu.tr)

Adres için IIS'te zaten bir site varsa (örneğin eski afiş sitesi; https bağlantısı ve SSL sertifikası hazır), 7. adım
yerine bu yol kullanılır (7.0'daki **A** durumu). Yeni site açılmaz; mevcut site Next projesine (`localhost:8080`) yönlendirilir. Sertifikaya ve
bağlantılara dokunulmaz.

### 7B.1 Eklentiler kurulu mu?

IIS Yöneticisi'nde (`inetmgr`) solda **sunucu adına** tıkla. Ortada **URL Rewrite** ve **Application Request Routing
Cache** simgeleri var mı bak. Biri yoksa iis.net'ten **URL Rewrite 2.1** ve **Application Request Routing 3.0**'ı kur,
sonra IIS Yöneticisi'ni kapatıp yeniden aç.

### 7B.2 Proxy ayarları (sunucu düzeyinde, bir kere)

1. **Sunucu adı** → **Application Request Routing Cache** → sağda **Server Proxy Settings**:
   - **Enable proxy** ✓
   - **Reverse rewrite host in response headers** ✗ (işareti kaldır)
   - **Apply**
2. **Sunucu adı** → **Configuration Editor** → üstte Section: `system.webServer/proxy`:
   - **preserveHostHeader** → **True**
   - **Apply**

İkinci kısım atlanırsa admin girişi ve anket gönderimi çalışmaz.

### 7B.3 Eski siteyi boşalt

1. Solda **Sites** altında `confdsa.atu.edu.tr`'nin bağlı olduğu siteyi bul. Sağda **Bindings**'e bak:
   `https 443 confdsa.atu.edu.tr` görünmeli. Bağlantılara dokunma.
2. `C:\inetpub\dsatalks` adında **boş** bir klasör oluştur.
3. Siteyi seç → sağda **Basic Settings** → **Physical path**: `C:\inetpub\dsatalks` → **OK**.

Böylece eski dosyalar ve içlerindeki eski yönlendirme kuralları (`web.config`, örneğin `/#!/` yönlendirmesi) devre dışı
kalır. Eski klasör silinmez; geri dönmek için Physical path'i eski klasöre çevirmek yeterli.

### 7B.4 Next'e yönlendirme kuralı

1. Aynı siteyi seç → **URL Rewrite**. Listede eski kurallar varsa sil.
2. Sağda **Add Rule(s)** → **Reverse Proxy** → adres: `localhost:8080` → **Enable SSL Offloading** ✓ → **OK**.

Pencerede "Rewrite the domain names of the links in HTTP responses" gibi bir **outbound** seçeneği çıkarsa
**işaretleme**: sıkıştırılmış sayfalarda hata verir ve gerekmez.

### 7B.5 https bilgisini ilet

1. URL Rewrite → sağda **View Server Variables** → **Add** → `HTTP_X_FORWARDED_PROTO` → **OK** → **Back to Rules**.
2. 7B.4'te oluşan kurala çift tıkla → **Server Variables** → **Add**:
   - Name: `HTTP_X_FORWARDED_PROTO`
   - Value: `https`
3. **Apply**.

### 7B.6 http'yi https'e yönlendir

1. URL Rewrite → **Add Rule(s)** → **Blank rule**:
   - Name: `HTTPS`
   - Pattern: `(.*)`
   - Conditions → Add: Condition input `{HTTPS}`, Pattern `^OFF$`
   - Action type: **Redirect** → Redirect URL `https://{HTTP_HOST}/{R:1}` → **Permanent (301)**
2. **Apply**.
3. Bu kuralı **Move Up** ile reverse proxy kuralının **üstüne** taşı.

### 7B.7 `.env`

```
NEXT_PUBLIC_SITE_URL="https://confdsa.atu.edu.tr"
AUTH_URL="https://confdsa.atu.edu.tr"
AUTH_TRUST_HOST=true
```

### 7B.8 Yeniden derle ve başlat

1. `services.msc` → DSATalks → **Durdur**
2. Komutlar:
   ```powershell
   cd C:\dsa-talks
   ```
   ```powershell
   npm run build
   ```
3. `services.msc` → DSATalks → **Başlat**

### 7B.9 Test

Tarayıcıda **gizli pencere** kullan (eski sitenin yönlendirmeleri önbellekte kalmış olabilir):

- [ ] `https://confdsa.atu.edu.tr` → DSATalks açılıyor
- [ ] `http://confdsa.atu.edu.tr` → https'e geçip DSATalks açılıyor
- [ ] `/admin` girişi oluyor, panel açılıyor
- [ ] `/anket` gönderiliyor, sertifika iniyor
- [ ] Telefondan **mobil veriyle** açılıyor

| Belirti | Bak |
|---|---|
| 502 hatası | DSATalks hizmeti çalışıyor mu? `C:\dsa-talks-logs\error.log` |
| Giriş sonrası `localhost:8080`'e atıyor | 7B.2'nin ikinci kısmı (preserveHostHeader) |
| Hâlâ `/#!/` adresine gidiyor | 7B.3 uygulanmamış ya da tarayıcı önbelleği; gizli pencerede dene |

### 7B.10 8080'i dışarıya kapat

Her şey çalışınca bilgi işlemden üniversite güvenlik duvarında **8080'i kapatmalarını** iste; Windows güvenlik duvarında
8080 için açılmış bir kural varsa kaldır. Site yalnızca `https://confdsa.atu.edu.tr` üzerinden erişilebilir olmalı.

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
