const primitive = 0x11d;

const [expTb, logTb] = (() => {
    let x = 1;
    let expTb = [], logTb = [];
    for (let i = 0; i < 255; ++i) {
        expTb[i] = x;
        logTb[x] = i;
        x <<= 1;
        if (x > 255) {
            x = (x ^ primitive) & 255;
        }
    }
    return [expTb, logTb];
})();

function gf_add(a, b) {
    return a ^ b;
}

function gf_mul(a, b) {
    if (a === 0 || b === 0) {
        return 0;
    }
    return expTb[(logTb[a] + logTb[b]) % 255];
}

function gf_inv(a) {
    if (a === 0) {
        throw `zero has no inverse`;
    }
    return expTb[(255 - logTb[a]) % 255];
}

function p_mul(a, b) {
    let c = new Uint8Array(a.length + b.length - 1);
    for (let i = 0; i < a.length; ++i) {
        for (let j = 0; j < b.length; ++j) {
            // c[i + j] = c[i + j] + a[i] * b[j];
            c[i + j] = gf_add(c[i + j], gf_mul(a[i], b[j]));
        }
    }
    return c;
}

// 產生除式
const get_division = (() => {
    let cache = [new Uint8Array([1])];
    return function (k) {
        for (let i = cache.length; i < k + 1; ++i) {
            // push: cache[i - 1] * [expTb(i - 1), 1]
            cache.push(p_mul(cache[i - 1], [1, expTb[i - 1]]));
        }
        return cache[k];
    }
})();

function p_mod(r, b) {
    let n = r.length - b.length;
    for (let i = 0; i <= n; ++i) {
        let t = gf_mul(r[i], gf_inv(b[0]));
        for (let k = 0; k < b.length; ++k) {
            // r[i-k] = r[i-k] - b[b.length - 1 - k] * t;
            r[i + k] = gf_add(r[i + k], gf_mul(b[k], t));
        }
    }
}

export { get_division, p_mod };