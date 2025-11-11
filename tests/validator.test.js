import { test } from 'node:test';
import assert from 'node:assert';
import { validateInput, checkRateLimit } from '../utils/validator.js';

test('validateInput - texto válido', () => {
    const result = validateInput('Olá, como você está?');
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.sanitized, 'Olá, como você está?');
});

test('validateInput - texto com caracteres perigosos', () => {
    const result = validateInput('Olá <script>alert("xss")</script>');
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.sanitized, 'Olá scriptalert(xss)/script');
});

test('validateInput - texto muito longo', () => {
    const longText = 'a'.repeat(1001);
    const result = validateInput(longText);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.error, 'Texto muito longo');
});

test('validateInput - entrada inválida', () => {
    const result = validateInput(null);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.error, 'Texto inválido');
});

test('checkRateLimit - dentro do limite', () => {
    const userId = 'test-user-1';
    const result = checkRateLimit(userId, 5, 60000);
    assert.strictEqual(result, true);
});

test('checkRateLimit - excede limite', () => {
    const userId = 'test-user-2';
    
    // Faz 5 requests (limite)
    for (let i = 0; i < 5; i++) {
        checkRateLimit(userId, 5, 60000);
    }
    
    // 6ª request deve falhar
    const result = checkRateLimit(userId, 5, 60000);
    assert.strictEqual(result, false);
});