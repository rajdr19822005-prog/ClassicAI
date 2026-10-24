import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

const classicAiAppTitle = 'ClassicalAI';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ClassicAiApp());
}

class ClassicAiApp extends StatelessWidget {
  const ClassicAiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: classicAiAppTitle,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0F766E)),
        useMaterial3: true,
      ),
      home: const ClassicAiWebApp(),
    );
  }
}

class ClassicAiWebApp extends StatefulWidget {
  const ClassicAiWebApp({super.key});

  @override
  State<ClassicAiWebApp> createState() => _ClassicAiWebAppState();
}

class _ClassicAiWebAppState extends State<ClassicAiWebApp> {
  late final WebViewController _controller;
  bool _isLoading = true;
  String? _loadError;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFFFFFFFF))
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (request) {
            final uri = Uri.tryParse(request.url);
            if (uri == null) return NavigationDecision.prevent;

            // Keep the WebView on bundled app assets. Permit only explicit user-initiated
            // WhatsApp links; block arbitrary external pages and non-HTTPS schemes.
            if (uri.scheme == 'file' &&
                uri.path.startsWith('/android_asset/flutter_assets/')) {
              return NavigationDecision.navigate;
            }
            if (uri.scheme == 'https' &&
                const {'wa.me', 'api.whatsapp.com'}.contains(uri.host)) {
              return NavigationDecision.navigate;
            }
            return NavigationDecision.prevent;
          },
          onPageStarted: (_) {
            if (mounted) {
              setState(() {
                _isLoading = true;
                _loadError = null;
              });
            }
          },
          onPageFinished: (_) {
            if (mounted) setState(() => _isLoading = false);
          },
          onWebResourceError: (error) {
            if (error.isForMainFrame == true && mounted) {
              setState(() {
                _isLoading = false;
                _loadError = 'The app page could not be loaded. Check your connection and retry.';
              });
            }
          },
        ),
      )
      ..loadFlutterAsset('assets/web/index.html');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            WebViewWidget(controller: _controller),
            if (_isLoading)
              const Positioned.fill(
                child: ColoredBox(
                  color: Colors.white,
                  child: Center(
                    child: CircularProgressIndicator(color: Color(0xFF0F766E)),
                  ),
                ),
              ),
            if (_loadError != null)
              Positioned.fill(
                child: ColoredBox(
                  color: Colors.white,
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.wifi_off, size: 40),
                          const SizedBox(height: 12),
                          Text(_loadError!, textAlign: TextAlign.center),
                          const SizedBox(height: 16),
                          FilledButton(
                            onPressed: () => _controller.reload(),
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
