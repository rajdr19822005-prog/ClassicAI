import 'package:flutter_test/flutter_test.dart';
import 'package:classicai/main.dart';

void main() {
  testWidgets('ClassicAI starter screen renders its release status', (tester) async {
    await tester.pumpWidget(const ClassicAiApp());

    expect(find.text('ClassicAI'), findsOneWidget);
    expect(find.text('A thoughtful start.'), findsOneWidget);
    expect(find.text('Flutter app shell initialized'), findsOneWidget);
    expect(find.text('Core product functionality still needs to be implemented'), findsOneWidget);
  });
}
