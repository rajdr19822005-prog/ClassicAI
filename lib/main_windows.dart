import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter_windows/webview_flutter_windows.dart';
import 'package:window_manager/window_manager.dart';

const classicAiDesktopUrl = 'https://classicai.vercel.app/assets/web/index.html';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await windowManager.ensureInitialized();

  const windowOptions = WindowOptions(
    fullScreen: true,
    titleBarStyle: TitleBarStyle.hidden,
    backgroundColor: Colors.white,
    title: 'ClassicAI',
  );
  windowManager.waitUntilReadyToShow(windowOptions, () async {
    await windowManager.show();
    await windowManager.focus();
  });

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
            : 'ClassicAI could not start. Check your internet connection and try again.\\n$error';
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

  KeyEventResult _handleKeyEvent(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent) return KeyEventResult.ignored;

    if (event.logicalKey == LogicalKeyboardKey.f11) {
      unawaited(windowManager.isFullScreen().then(
        (isFullScreen) => windowManager.setFullScreen(!isFullScreen),
      ));
      return KeyEventResult.handled;
    }

    if (event.logicalKey == LogicalKeyboardKey.escape) {
      unawaited(windowManager.setFullScreen(false));
      return KeyEventResult.handled;
    }

    if (event.logicalKey == LogicalKeyboardKey.f5 ||
        (event.logicalKey == LogicalKeyboardKey.keyR &&
            HardwareKeyboard.instance.isControlPressed)) {
      unawaited(_reload());
      return KeyEventResult.handled;
    }

    return KeyEventResult.ignored;
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Focus(
        autofocus: true,
        onKeyEvent: _handleKeyEvent,
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (_ready) Webview(_controller),
            if (_loading)
              const ColoredBox(
                color: Colors.white,
                child: Center(
                  child: CircularProgressIndicator(
                    color: Color(0xFF0F766E),
                  ),
                ),
              ),
            if (_error != null)
              ColoredBox(
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
                          const SizedBox(height: 12),
                          const Text(
                            'F11: toggle fullscreen  •  Esc: exit fullscreen  •  F5: reload',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.black54, fontSize: 12),
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
