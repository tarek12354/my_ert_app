import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_blue/flutter_blue.dart';
import 'package:path_provider/path_provider.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: ERTPage(),
    );
  }
}

class ERTPage extends StatefulWidget {
  const ERTPage({super.key});

  @override
  State<ERTPage> createState() => _ERTPageState();
}

class _ERTPageState extends State<ERTPage> {
  BluetoothDevice? device;
  BluetoothCharacteristic? txChar;

  bool isConnected = false;
  String statusText = "Non connecté";

  List<String> measurements = [];
  double a = 5.0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Application ERT – Tarek Ben Attia"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [

            /// زر الاتصال
            ElevatedButton(
              onPressed: connectBluetooth,
              child: const Text("Connexion Bluetooth"),
            ),

            const SizedBox(height: 8),

            /// مؤشر الحالة
            Row(
              children: [
                Icon(
                  Icons.circle,
                  size: 12,
                  color: isConnected ? Colors.green : Colors.red,
                ),
                const SizedBox(width: 8),
                Text(statusText),
              ],
            ),

            const Divider(height: 30),

            /// إدخال a
            TextField(
              decoration: const InputDecoration(
                labelText: "Espacement a (m)",
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
              onChanged: (v) {
                a = double.tryParse(v) ?? 5.0;
              },
            ),

            const SizedBox(height: 12),

            /// بدء الخط
            ElevatedButton(
              onPressed: isConnected ? startLine : null,
              child: const Text("Démarrer la ligne"),
            ),

            /// القياس التالي
            ElevatedButton(
              onPressed: isConnected ? nextMeasurement : null,
              child: const Text("Mesure suivante"),
            ),

            /// تصدير الملف
            ElevatedButton(
              onPressed: isConnected ? exportFile : null,
              child: const Text("Exporter fichier Res2Dinv"),
            ),

            const SizedBox(height: 20),

            Text(
              "Nombre de mesures: ${measurements.length}",
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  // ================= Bluetooth =================

  void connectBluetooth() async {
    FlutterBlue flutterBlue = FlutterBlue.instance;

    setState(() {
      statusText = "Recherche ESP32...";
    });

    flutterBlue.startScan(timeout: const Duration(seconds: 5));

    flutterBlue.scanResults.listen((results) async {
      for (ScanResult r in results) {
        if (r.device.name == "ESP32_ERT") {
          await flutterBlue.stopScan();

          device = r.device;
          await device!.connect();

          List<BluetoothService> services =
              await device!.discoverServices();

          for (var s in services) {
            for (var c in s.characteristics) {
              if (c.properties.write && c.properties.notify) {
                txChar = c;
                await c.setNotifyValue(true);
                c.value.listen(onDataReceived);

                setState(() {
                  isConnected = true;
                  statusText = "Connecté à ESP32";
                });
                return;
              }
            }
          }
        }
      }
    });
  }

  // ================= أوامر =================

  void send(String cmd) {
    txChar?.write("$cmd\n".codeUnits);
  }

  void startLine() {
    measurements.clear();
    send("A=$a");
    send("RESET");
  }

  void nextMeasurement() {
    send("NEXT");
  }

  // ================= استقبال =================

  void onDataReceived(List<int> data) {
    String line = String.fromCharCodes(data).trim();

    if (line == "ERR" || line.isEmpty) return;

    setState(() {
      measurements.add(line);
    });
  }

  // ================= تصدير الملف =================

  Future<void> exportFile() async {
    final dir = await getExternalStorageDirectory();
    final file = File("${dir!.path}/ert_line.txt");

    String content = "ERT LINE\n";
    content += "$a\n";
    content += "${measurements.length}\n";

    for (var m in measurements) {
      content += m.replaceAll(",", " ") + "\n";
    }

    await file.writeAsString(content);
  }
}
