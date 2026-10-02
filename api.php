<?php
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "db_devclub");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Koneksi database gagal!"]);
    exit();
}

// BUG FIX: set charset utf8mb4 agar nama dengan karakter khusus
// tersimpan dan tampil dengan benar (mencegah masalah encoding).
$conn->set_charset("utf8mb4");

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'daftar') {

    $input = json_decode(file_get_contents('php://input'), true);

    $nis    = trim($input['nis'] ?? '');
    $nama   = trim($input['nama'] ?? '');
    $divisi = trim($input['divisi'] ?? '');
    $email  = trim($input['email'] ?? '');

    if (empty($nis) || empty($nama) || empty($divisi) || empty($email)) {
        echo json_encode(["status" => "error", "message" => "Semua field formulir wajib diisi!"]);
        exit();
    }

    // BUG FIX: validasi format NIS (8 digit angka) di sisi server.
    // Sebelumnya hanya divalidasi di client-side, sehingga request
    // langsung ke API (tanpa lewat form) bisa melewati validasi.
    if (!preg_match('/^[0-9]{8}$/', $nis)) {
        echo json_encode(["status" => "error", "message" => "Format NIS tidak valid, harus 8 digit angka!"]);
        exit();
    }

    // BUG FIX: validasi format email di sisi server.
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "Format email tidak valid!"]);
        exit();
    }

    // Safe Database Query using Prepared Statement
    $stmt = $conn->prepare("INSERT INTO pendaftaran (nis, nama, divisi, email) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $nis, $nama, $divisi, $email);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Selamat! Data pendaftaran berhasil disimpan."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Gagal menyimpan! NIS mungkin sudah terdaftar."]);
    }

    $stmt->close();
} else {
    // BUG FIX: sebelumnya jika action/method tidak cocok, skrip tidak
    // mengeluarkan output sama sekali. Ini menyebabkan response.json()
    // di app.js gagal (Unexpected end of JSON input) karena body kosong.
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Endpoint atau metode request tidak valid!"]);
}

$conn->close();