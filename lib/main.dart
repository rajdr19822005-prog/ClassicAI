import 'package:flutter/material.dart';

void main() {
  runApp(const ClassicAiApp());
}

class ClassicAiApp extends StatelessWidget {
  const ClassicAiApp({super.key});

  @override
  Widget build(BuildContext context) {
    const ink = Color(0xFF14213D);
    const accent = Color(0xFF4263EB);

    return MaterialApp(
      title: 'ClassicAI',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: accent),
        scaffoldBackgroundColor: const Color(0xFFF7F8FC),
        useMaterial3: true,
      ),
      home: Scaffold(
        appBar: AppBar(
          title: const Text('ClassicAI', style: TextStyle(fontWeight: FontWeight.w700)),
          backgroundColor: Colors.white,
          foregroundColor: ink,
          elevation: 0,
        ),
        body: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Card(
                elevation: 0,
                color: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                child: Padding(
                  padding: const EdgeInsets.all(28),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: accent.withValues(alpha: 0.10),
                          borderRadius: BorderRadius.circular(18),
                        ),
                        child: const Icon(Icons.auto_awesome_rounded, color: accent, size: 30),
                      ),
                      const SizedBox(height: 24),
                      const Text('A thoughtful start.', style: TextStyle(fontSize: 28, height: 1.15, fontWeight: FontWeight.w800, color: ink)),
                      const SizedBox(height: 12),
                      const Text(
                        'The ClassicAI Android foundation is in place. The product features and connected services can now be added and tested here.',
                        style: TextStyle(fontSize: 16, height: 1.55, color: Color(0xFF5E6678)),
                      ),
                      const SizedBox(height: 24),
                      const Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.check_circle_outline_rounded, color: accent),
                          SizedBox(width: 10),
                          Expanded(child: Text('Flutter app shell initialized', style: TextStyle(color: ink))),
                        ],
                      ),
                      const SizedBox(height: 12),
                      const Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.construction_rounded, color: accent),
                          SizedBox(width: 10),
                          Expanded(child: Text('Core product functionality still needs to be implemented', style: TextStyle(color: ink))),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
