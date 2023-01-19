const isKonguEmail = (email) => {
    try{
        let domain = email.split('@')[1];
        if(domain !== 'kongu.edu')
            return false;
        
        return true
    }
    catch(err){
        return false;
    }
}

module.exports = {isKonguEmail}