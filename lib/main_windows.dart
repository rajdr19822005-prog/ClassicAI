import 'package:flutter/material.dart';
import 'package:webview_flutter_windows/webview_flutter_windows.dart';

const classicAiDesktopUrl = 'https://classicai.vercel.app/assets/web/index.html';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ClassicAiDesktopApp());
}

class ClassicAiDesktopApp extends StatelessWidget {
  const ClassicAiDesktopApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ClassicAI Desktop',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0F766E)),
        useMaterial3: true,
      ),
      home: const ClassicAiDesktopHome(),
    );
  }
}

class ClassicAiDesktopHome extends StatefulWidget {
  const ClassicAiDesktopHome({super.key});

  @override
  State<ClassicAiDesktopHome> createState() => _ClassicAiDesktopHomeState();
}

class _ClassicAiDesktopHomeState extends State<ClassicAiDesktopHome> {
  final WebviewController _controller = WebviewController();
  bool _ready = false;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    try {
      await _controller.initialize();
      await _controller.setDefaultContextMenusEnabled(true);
      await _controller.setPopupWindowPolicy(WebviewPopupWindowPolicy.deny);
      await _controller.loadUrl(classicAiDesktopUrl);
      if (!mounted) return;
      setState(() {
        _ready = true;
        _loading = false;
        _error = null;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = error.toString().contains('environment_creation_failed')
            ? 'Microsoft Edge WebView2 Runtime is not available. Install or repair WebView2, then restart ClassicAI.'
            : 'ClassicAI could not start. Check your internet connection and try again.\n$error';
      });
    }
  }

  Future<void> _reload() async {
    if (!_ready) {
      setState(() {
        _loading = true;
        _error = null;
      });
      await _initialize();
      return;
    }
    setState(() => _loading = true);
    try {
      await _controller.reload();
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ClassicAI'),
        actions: [
          IconButton(
            tooltip: 'Reload',
            onPressed: _reload,
            icon: const Icon(Icons.refresh),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Stack(
        children: [
          if (_ready) Positioned.fill(child: Webview(_controller)),
          if (_loading)
            const Positioned.fill(
              child: ColoredBox(
                color: Colors.white,
                child: Center(
                  child: CircularProgressIndicator(
                    color: Color(0xFF0F766E),
                  ),
                ),
              ),
            ),
          if (_error != null)
            Positioned.fill(
              child: ColoredBox(
                color: Colors.white,
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(28),
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 520),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.desktop_windows_outlined, size: 48),
                          const SizedBox(height: 16),
                          const Text(
                            'ClassicAI Desktop could not connect',
                            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 12),
                          Text(_error!, textAlign: TextAlign.center),
                          const SizedBox(height: 20),
                          FilledButton.icon(
                            onPressed: _reload,
                            icon: const Icon(Icons.refresh),
                            label: const Text('Retry'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
