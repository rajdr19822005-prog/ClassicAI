import 'package:flutter_test/flutter_test.dart';
import 'package:classicai/main.dart';

void main() {
  test('Doctor app title is configured by default', () {
    expect(classicAiAppTitle, 'ClassicalAI Doctor');
  });

  test('Admin build can be selected with APP_KIND', () {
    // APP_KIND is supplied at build time; the default remains the doctor app.
    expect(appKind, anyOf('doctor', 'admin'));
    expect(classicAiAppTitle, isNotEmpty);
  });
}
