""" 
{
    "personalInfo": {
    	"firstname": "agent",
    	"lastname": "eleven",
    	"email": "fake101@fake.com"
    },
    "details": {
    	"languages": {
    		"english": 0,
    		"chinese": 0,
    		"malay": 0
    	},
    	"skills": {
    		"insurance": 0,
    		"bank_statement": 0,
    		"fraud": 0
    	}
    },
    "availability": 1,
	"password": "ASd23ads!",
	"routeFilters": "english+chinese+insurance"
}
 """
import json
import names
import random
import re
import string

def personalInfo():
	firstname = names.get_first_name()
	lastname = names.get_last_name()
	extensions = ['com','net','org','gov']
	domains = ['gmail','yahoo','comcast','verizon','charter','hotmail','outlook','frontier']
	delimiter = ['', '.', '_']
	email = firstname + delimiter[random.randint(0, len(delimiter)-1)] + lastname + "@" + domains[random.randint(0, len(domains)-1)] + "." + extensions[random.randint(0, len(extensions)-1)]
	res = {
		"firstname": firstname,
		"lastname": lastname,
		"email": email
	}
	return res

def languages():
	res = {
		"english": random.randint(0,1),
		"chinese": random.randint(0,1),
		"malay": random.randint(0,1)
	}
	return res

def skills():
	res = {
		"insurance": random.randint(0,1),
		"bank_statement": random.randint(0,1),
		"fraud": random.randint(0,1)
	}
	return res

def password():
	length = random.randint(8,64)
	l = []
	l.extend(string.ascii_letters)
	l.extend(string.digits)
	l.extend("@#$%^&+=")
	while True:
		s = ''.join(random.choice(l) for i in range(length))
		if re.match(r'[A-Za-z0-9@#$%^&+=]{8,64}',s):
			if re.search(r'[@#$%^&+=]', s) != None and re.search(r'[A-Z]', s) != None and re.search(r'[a-z]', s) != None and re.search(r'[0-9]', s) != None:
				break
	return s

def routeFilters():
	r = ["english", "chinese", "malay", "insurance", "bank_statement", "fraud"]
	length = random.randint(1,6)
	res = '+'.join(random.choice(r) for i in range(length))
	return res

def fuzz(n, threads):
	for j in range(threads): 
		with open('generated_positive' + str(j)+ '.json', 'w', encoding= 'utf-8') as f:
			data_array = []
			for i in range(n):
				print("Starting " + str(i))
				data = {
					"personalInfo": personalInfo(),
					"details": {
						"languages": languages(),
						"skills": skills()
					},
					"availability": 1,
					"password": password(),
					"routeFilters": routeFilters()
				}
				data_array.append(data)
				
				
			json.dump(data_array,f, ensure_ascii=False, indent=4)


if __name__ == "__main__":
	fuzz(5, 2)
