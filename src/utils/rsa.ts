import JSEncrypt from 'jsencrypt'
import store from '@/store'

const encrypt = new JSEncrypt()

export const rsa = async (plaintext: string): Promise<string | false> => {
    const publicKey = store.state.publicKey

    encrypt.setPublicKey(publicKey)

    return encrypt.encrypt(plaintext)
}
