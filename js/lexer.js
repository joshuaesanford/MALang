// lexer.js - MALangLexer
class MALangLexer   
{ // CONSTRUCTOR
  constructor(input) 
  { // traverse input using input[i] where i < this.input.length and i >= 0.
    this.input = input;
    this.pos = 0;
  }

  tokenize() 
  { const tokens = [];
    let token;
    while (this.pos < this.input.length) 
	  { // get token at this.input[this.pos] then assign it. increment this.pos.
      token = this.get_next_token();
      if (token)
      { tokens.push(token);
      }
    }
    return tokens;
  }

  get_next_token() 
  { // pos is out of range?
    if (this.pos >= this.input.length)
    { return null;
    }
    // instantiate the character at the current position.
    const current_char = this.input[this.pos];
    // handle open brace
    if (current_char === '{') 
	  { this.pos++;
      return new Token('OPEN_BRACE', current_char);
    } 
    // handle close brace
    else if (current_char === '}') 
	  { this.pos++;
        return new Token('CLOSE_BRACE', current_char);
    } 
    // handle open square bracket
    else if (current_char === '[') 
 	  { this.pos++;
        return new Token('OPEN_SQUARE_BRACKET', current_char);
    } 
    // handle close square bracket
    else if (current_char === ']') 
	  { this.pos++;
        return new Token('CLOSE_SQUARE_BRACKET', current_char);
    } 
    // handle open angle bracket
    else if (current_char === '<') 
	  { this.pos++;
        return new Token('OPEN_ANGLE_BRACKET', current_char);
    } 
    // handle close angle bracket
    else if (current_char === '>') 
	  { this.pos++;
        return new Token('CLOSE_ANGLE_BRACKET', current_char);
    } 
    // handle open paren
    else if (current_char === '(') 
	  { this.pos++;
        return new Token('OPEN_PAREN', current_char);
    } 
    // handle close paren
    else if (current_char === ')') 
	  { this.pos++;
        return new Token('CLOSE_PAREN', current_char);
    } 
    // handle comma
    else if (current_char === ',') 
	  { this.pos++;
        return new Token('COMMA', current_char);
	  } 
    // handle plus
    else if (current_char === '+') 
	  { this.pos++;
		  return new Token('PLUS', current_char);
	  }
    // handle minus
    else if (current_char == '-') 
	  { this.pos++
  		return new Token('MINUS', current_char);
    } 
    // the `;` character denotes line comments			
    else if (current_char === ';') 
    // all characters including and beyond a semi-colon are skipped, until a linebreak occurs.
	  { while (this.pos < this.input.length && this.input[this.pos] !== '\n') 
	    { this.pos++;
      }
      // skip the linebreak too.
      this.pos++;
      // return null because no content needs to be pushed.
      return null;
    } 
    // handle slash
    else if (current_char === '/') 
	  { this.pos++;
      return new Token('SLASH', current_char);
    } 
    // handle numbers
    else if (/\d/.test(current_char)) 
	  { let number_value = current_char;
      this.pos++;
      while (this.pos < this.input.length && /\d/.test(this.input[this.pos])) 
		  { number_value += this.input[this.pos];
        this.pos++;
      }
      return new Token('NUMBER', number_value);
    } 
    // handle whitespace
    else if (/\s/.test(current_char)) 
	  { this.pos++;
      return null;
    } 
    // handle identifiers
    else if (/[a-zA-Z_]/.test(current_char)) 
	  { let identifier_value = current_char;
      this.pos++;
      // in range and the new input character is still a letter or underscore? 
      while (this.pos < this.input.length && /[a-zA-Z_]/.test(this.input[this.pos])) 
	    { // collect chars for the identifier value.
        identifier_value += this.input[this.pos];
        // move on to the next char.
        this.pos++;
      }
      // when any other character is reached, we return the identifier.
      return new Token('IDENTIFIER', identifier_value);
    } 
    // handle unsupported characters.
    else 
    { throw new Error(`Unexpected character: ${current_char}`);
    }
  } // end of get_next_token()
} // end of MALangLexer class
